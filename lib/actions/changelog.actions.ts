"use server";

import { db } from "@/lib/db";
import { productChangelogs, type ProductChangelog, type NewProductChangelog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Parses semver string (e.g. "v1.2.0") into numeric tuple [major, minor, patch] for sorting.
 */
function parseSemver(v: string): [number, number, number] {
  const clean = v.replace(/^v/i, "");
  const parts = clean.split(".").map(Number);
  return parts.length === 3 && parts.every((n) => !isNaN(n))
    ? [parts[0], parts[1], parts[2]]
    : [0, 0, 0];
}

/**
 * Retrieves all changelogs for a given Tebex Package ID, sorted by semver & date descending.
 */
export async function getChangelogsByPackageId(tebexPackageId: string): Promise<ProductChangelog[]> {
  try {
    const records = await db
      .select()
      .from(productChangelogs)
      .where(eq(productChangelogs.tebexPackageId, tebexPackageId))
      .orderBy(desc(productChangelogs.createdAt));

    // Sort descending by semver
    return records.sort((a, b) => {
      const [majA, minA, patchA] = parseSemver(a.version);
      const [majB, minB, patchB] = parseSemver(b.version);
      if (majA !== majB) return majB - majA;
      if (minA !== minB) return minB - minA;
      if (patchA !== patchB) return patchB - patchA;
      // Fallback compare release date
      return (b.releaseDate || "").localeCompare(a.releaseDate || "");
    });
  } catch (error) {
    console.error("[getChangelogsByPackageId] Error fetching changelogs:", error);
    return [];
  }
}

/**
 * Creates a new product changelog entry.
 */
export async function createChangelog(data: {
  tebexPackageId: string;
  version: string;
  releaseDate: string;
  title?: string;
  changes: string[];
  bodyHtml?: string;
}) {
  try {
    const formattedVersion = data.version.trim().startsWith("v")
      ? data.version.trim()
      : `v${data.version.trim()}`;

    const [inserted] = await db
      .insert(productChangelogs)
      .values({
        tebexPackageId: data.tebexPackageId,
        version: formattedVersion,
        releaseDate: data.releaseDate.trim(),
        title: data.title?.trim() || null,
        changes: data.changes.filter((c) => c.trim().length > 0),
        bodyHtml: data.bodyHtml?.trim() || null,
      })
      .returning();

    revalidatePath("/admin/products");
    revalidatePath("/store");
    revalidatePath(`/store/${data.tebexPackageId}`);

    return { success: true, changelog: inserted };
  } catch (error: any) {
    console.error("[createChangelog] Error creating changelog:", error);
    return { success: false, error: error.message || "Failed to create changelog" };
  }
}

/**
 * Updates an existing changelog entry.
 */
export async function updateChangelog(
  id: string,
  data: {
    tebexPackageId: string;
    version?: string;
    releaseDate?: string;
    title?: string;
    changes?: string[];
    bodyHtml?: string;
  }
) {
  try {
    const updates: Partial<NewProductChangelog> = {
      updatedAt: new Date(),
    };

    if (data.version !== undefined) {
      updates.version = data.version.trim().startsWith("v")
        ? data.version.trim()
        : `v${data.version.trim()}`;
    }
    if (data.releaseDate !== undefined) updates.releaseDate = data.releaseDate.trim();
    if (data.title !== undefined) updates.title = data.title.trim() || null;
    if (data.changes !== undefined) {
      updates.changes = data.changes.filter((c) => c.trim().length > 0);
    }
    if (data.bodyHtml !== undefined) updates.bodyHtml = data.bodyHtml.trim() || null;

    const [updated] = await db
      .update(productChangelogs)
      .set(updates)
      .where(eq(productChangelogs.id, id))
      .returning();

    revalidatePath("/admin/products");
    revalidatePath("/store");
    revalidatePath(`/store/${data.tebexPackageId}`);

    return { success: true, changelog: updated };
  } catch (error: any) {
    console.error("[updateChangelog] Error updating changelog:", error);
    return { success: false, error: error.message || "Failed to update changelog" };
  }
}

/**
 * Deletes a changelog entry by its ID.
 */
export async function deleteChangelog(id: string, tebexPackageId: string) {
  try {
    await db.delete(productChangelogs).where(eq(productChangelogs.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/store");
    revalidatePath(`/store/${tebexPackageId}`);

    return { success: true };
  } catch (error: any) {
    console.error("[deleteChangelog] Error deleting changelog:", error);
    return { success: false, error: error.message || "Failed to delete changelog" };
  }
}

/**
 * Retrieves counts and latest versions of changelogs keyed by tebexPackageId.
 */
export async function getChangelogMetadataByProduct(): Promise<
  Record<string, { count: number; latestVersion: string | null; lastUpdated: string | null }>
> {
  try {
    const all = await db.select().from(productChangelogs);
    const map: Record<string, { count: number; latestVersion: string | null; lastUpdated: string | null }> = {};

    for (const item of all) {
      if (!map[item.tebexPackageId]) {
        map[item.tebexPackageId] = {
          count: 0,
          latestVersion: null,
          lastUpdated: null,
        };
      }
      map[item.tebexPackageId].count += 1;
    }

    // Determine latest version for each
    for (const pkgId of Object.keys(map)) {
      const items = all.filter((x) => x.tebexPackageId === pkgId);
      items.sort((a, b) => {
        const [majA, minA, patchA] = parseSemver(a.version);
        const [majB, minB, patchB] = parseSemver(b.version);
        if (majA !== majB) return majB - majA;
        if (minA !== minB) return minB - minA;
        if (patchA !== patchB) return patchB - patchA;
        return (b.releaseDate || "").localeCompare(a.releaseDate || "");
      });
      if (items.length > 0) {
        map[pkgId].latestVersion = items[0].version;
        map[pkgId].lastUpdated = items[0].releaseDate;
      }
    }

    return map;
  } catch (error) {
    console.error("[getChangelogMetadataByProduct] Error:", error);
    return {};
  }
}

/**
 * One-click migration helper: imports legacy [[changelog]] block from Tebex package description
 * into the PostgreSQL product_changelogs table if no entries exist yet.
 */
export async function importLegacyChangelogs(
  tebexPackageId: string,
  rawHtml: string
): Promise<{ success: boolean; importedCount: number; message: string }> {
  try {
    const existing = await db
      .select()
      .from(productChangelogs)
      .where(eq(productChangelogs.tebexPackageId, tebexPackageId));

    if (existing.length > 0) {
      return {
        success: false,
        importedCount: 0,
        message: "This product already has changelogs in the database.",
      };
    }

    // Extract [[changelog]]...[[/changelog]]
    const changelogBlockMatch = rawHtml.match(/\[\[changelog\]\]([\s\S]*?)(?:\[\[\/changelog\]\]|$)/i);
    if (!changelogBlockMatch) {
      return {
        success: false,
        importedCount: 0,
        message: "No [[changelog]] section found in product description.",
      };
    }

    const block = changelogBlockMatch[1];
    const entries = block.matchAll(/<h3>([\s\S]*?)<\/h3>([\s\S]*?)(?=(?:<h3>|$))/gi);
    const toInsert: NewProductChangelog[] = [];

    for (const em of entries) {
      const header = em[1].replace(/<[^>]*>/g, "").trim();
      const body = em[2].trim();

      const parts = header.split("|").map((s) => s.trim());
      const version = parts[0] || "v1.0.0";
      const releaseDate = parts[1] || new Date().toISOString().split("T")[0];

      const changes: string[] = [];
      const liMatches = body.matchAll(/<li>([\s\S]*?)<\/li>/gi);
      for (const lm of liMatches) {
        const text = lm[1].replace(/<[^>]*>/g, "").trim();
        if (text) changes.push(text);
      }

      toInsert.push({
        tebexPackageId,
        version,
        releaseDate,
        title: null,
        changes,
        bodyHtml: changes.length === 0 ? body : null,
      });
    }

    if (toInsert.length === 0) {
      return {
        success: false,
        importedCount: 0,
        message: "No changelog entries could be parsed from the description.",
      };
    }

    await db.insert(productChangelogs).values(toInsert);

    revalidatePath("/admin/products");
    revalidatePath("/store");
    revalidatePath(`/store/${tebexPackageId}`);

    return {
      success: true,
      importedCount: toInsert.length,
      message: `Successfully imported ${toInsert.length} release(s) to PostgreSQL.`,
    };
  } catch (error: any) {
    console.error("[importLegacyChangelogs] Error:", error);
    return {
      success: false,
      importedCount: 0,
      message: error.message || "Failed to import changelogs",
    };
  }
}

import {
  FRAMEWORKS,
  Framework,
  Dependency,
  FaqItem,
  Review,
  ChangelogEntry,
  ParsedDescription,
  PATTERNS,
} from "@/lib/types/description";

const VALID_SECTIONS = new Set(["features", "compat", "faq", "reviews", "changelog"]);

interface Range {
  start: number;
  end: number;
}

/**
 * Decodes common HTML entities into plain text.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * Strips HTML tags and trims the result.
 */
function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ""));
}

/**
 * Parses semver string (e.g. "v1.2.0") into numeric tuple [major, minor, patch].
 */
function parseSemver(v: string): [number, number, number] {
  const clean = v.replace(/^v/, "");
  const parts = clean.split(".").map(Number);
  return parts.length === 3 && parts.every((n) => !isNaN(n))
    ? [parts[0], parts[1], parts[2]]
    : [0, 0, 0];
}

/**
 * Robust parser for Tebex package HTML descriptions with section markers:
 * [[features]], [[compat]], [[faq]], [[changelog]], [[reviews]].
 * 
 * Handles:
 * - Unclosed markers (terminates implicitly at next marker or EOF)
 * - Markers not alone in their own paragraph (inline markers)
 * - Duplicate section blocks (aggregates content and warns)
 * - Case-insensitive markers ([[Faq]], [[FAQ]])
 * - Strips all marker syntax from descriptionHtml so NO raw tags ever leak to the UI.
 */
export function parsePackageDescription(rawHtml: string = ""): ParsedDescription {
  const warnings: string[] = [];

  if (!rawHtml || typeof rawHtml !== "string") {
    return {
      descriptionHtml: "",
      features: [],
      compat: { frameworks: [], dependencies: [] },
      faq: [],
      reviews: [],
      changelog: [],
      version: null,
      lastUpdated: null,
      reviewCount: 0,
      averageRating: null,
      warnings: ["Empty or invalid description string provided."],
    };
  }

  // 1. Locate all marker tokens: [[tag]] or [[/tag]]
  const markerRegex = /\[\[(\/?)([\w-]+)\]\]/gi;
  interface MarkerMatch {
    fullMatch: string;
    isClose: boolean;
    name: string;
    startIndex: number;
    endIndex: number;
    blockStart: number;
    blockEnd: number;
    isAloneInP: boolean;
  }

  const markers: MarkerMatch[] = [];
  let m: RegExpExecArray | null;

  while ((m = markerRegex.exec(rawHtml)) !== null) {
    const isClose = m[1] === "/";
    const name = m[2].toLowerCase();
    const startIndex = m.index;
    const endIndex = m.index + m[0].length;

    // Check if marker is alone in its own <p> paragraph
    const beforeStr = rawHtml.slice(Math.max(0, startIndex - 30), startIndex);
    const afterStr = rawHtml.slice(endIndex, endIndex + 30);

    const pOpenMatch = beforeStr.match(/<p\s*[^>]*>\s*$/i);
    const pCloseMatch = afterStr.match(/^\s*<\/p>/i);

    let blockStart = startIndex;
    let blockEnd = endIndex;
    let isAloneInP = false;

    if (pOpenMatch && pCloseMatch) {
      isAloneInP = true;
      blockStart = startIndex - pOpenMatch[0].length;
      blockEnd = endIndex + pCloseMatch[0].length;
    } else {
      warnings.push(`Marker [[${isClose ? "/" : ""}${m[2]}]] is not alone in its own <p> paragraph.`);
    }

    markers.push({
      fullMatch: m[0],
      isClose,
      name,
      startIndex,
      endIndex,
      blockStart,
      blockEnd,
      isAloneInP,
    });
  }

  // 2. Pair markers into sections and collect content
  const sectionBlocks: Record<string, string[]> = {};
  const removedRanges: Range[] = [];
  const sectionCounts: Record<string, number> = {};

  for (let i = 0; i < markers.length; i++) {
    const token = markers[i];

    if (token.isClose) {
      // Stray close marker without opening
      continue;
    }

    const name = token.name;
    if (!VALID_SECTIONS.has(name)) {
      warnings.push(`Unknown section marker name: "[[${token.name}]]"`);
    } else {
      sectionCounts[name] = (sectionCounts[name] || 0) + 1;
      if (sectionCounts[name] > 1) {
        warnings.push(`Duplicate section marker found: [[${name}]]`);
      }
    }

    // Find closing marker or next opening marker
    let closeTokenIndex = -1;
    let nextOpenTokenIndex = -1;

    for (let j = i + 1; j < markers.length; j++) {
      if (markers[j].isClose && markers[j].name === name) {
        closeTokenIndex = j;
        break;
      }
      if (!markers[j].isClose && nextOpenTokenIndex === -1) {
        nextOpenTokenIndex = j;
      }
    }

    let content = "";
    let rangeStart = token.blockStart;
    let rangeEnd = token.blockEnd;

    if (closeTokenIndex !== -1) {
      // Properly closed section
      const closeToken = markers[closeTokenIndex];
      content = rawHtml.slice(token.blockEnd, closeToken.blockStart);
      rangeEnd = closeToken.blockEnd;
      // Advance loop index to the closing token
      i = closeTokenIndex;
    } else if (nextOpenTokenIndex !== -1) {
      // Unclosed section: ends implicitly at next opening marker
      const nextToken = markers[nextOpenTokenIndex];
      content = rawHtml.slice(token.blockEnd, nextToken.blockStart);
      rangeEnd = nextToken.blockStart;
      warnings.push(`Unclosed section marker [[${name}]] (closed implicitly before next marker).`);
    } else {
      // Unclosed section: ends implicitly at end of text
      content = rawHtml.slice(token.blockEnd);
      rangeEnd = rawHtml.length;
      warnings.push(`Unclosed section marker [[${name}]] (closed implicitly at end of description).`);
    }

    if (VALID_SECTIONS.has(name)) {
      if (!sectionBlocks[name]) sectionBlocks[name] = [];
      sectionBlocks[name].push(content);
    }

    removedRanges.push({ start: rangeStart, end: rangeEnd });
  }

  // 3. Clean descriptionHtml: remove all section ranges
  // Sort ranges descending so deletion doesn't shift upcoming indices
  removedRanges.sort((a, b) => b.start - a.start);
  let descriptionHtml = rawHtml;
  for (const r of removedRanges) {
    descriptionHtml = descriptionHtml.slice(0, r.start) + descriptionHtml.slice(r.end);
  }

  // Strip any remaining inline or orphan markers (e.g. stray [[Faq]] or [[/faq]])
  descriptionHtml = descriptionHtml
    .replace(/(?:<p\s*[^>]*>\s*)?\[\[\/?[\w-]+\]\](?:\s*<\/p>)?/gi, "")
    .replace(/\[\[\/?[\w-]+\]\]/gi, "")
    .replace(/<p\s*[^>]*>\s*(?:&nbsp;)?\s*<\/p>/gi, "")
    .trim();

  // 4. Features extraction
  const features: string[] = [];
  if (sectionBlocks.features) {
    for (const block of sectionBlocks.features) {
      const liMatches = block.matchAll(/<li>([\s\S]*?)<\/li>/gi);
      for (const lm of liMatches) {
        const text = stripHtml(lm[1]);
        if (text) features.push(text);
      }
    }
  }

  // 5. Compatibility extraction
  const compat: { frameworks: Framework[]; dependencies: Dependency[] } = {
    frameworks: [],
    dependencies: [],
  };

  if (sectionBlocks.compat) {
    for (const block of sectionBlocks.compat) {
      const frameworksMatch = block.match(/<h3>Frameworks<\/h3>([\s\S]*?)(?:<h3>|$)/i);
      if (frameworksMatch) {
        const liMatches = frameworksMatch[1].matchAll(/<li>([\s\S]*?)<\/li>/gi);
        for (const lm of liMatches) {
          const item = stripHtml(lm[1]);
          if (FRAMEWORKS.includes(item as Framework)) {
            if (!compat.frameworks.includes(item as Framework)) {
              compat.frameworks.push(item as Framework);
            }
          } else if (item) {
            warnings.push(`Unknown framework in [[compat]]: "${item}"`);
          }
        }
      }

      const depsMatch = block.match(/<h3>Dependencies<\/h3>([\s\S]*?)(?:<h3>|$)/i);
      if (depsMatch) {
        const liMatches = depsMatch[1].matchAll(/<li>([\s\S]*?)<\/li>/gi);
        for (const lm of liMatches) {
          const rawLine = stripHtml(lm[1]);
          if (!rawLine) continue;

          if (PATTERNS.dependency.test(rawLine)) {
            const [name, reqStr] = rawLine.split("|").map((s) => s.trim());
            compat.dependencies.push({
              name,
              required: reqStr.toLowerCase() === "required",
            });
          } else {
            warnings.push(
              `Malformed dependency line: "${rawLine}" (expected format: name | required or name | optional)`
            );
          }
        }
      }
    }
  }

  // 6. FAQ extraction
  const faq: FaqItem[] = [];
  if (sectionBlocks.faq) {
    for (const block of sectionBlocks.faq) {
      const faqBlocks = block.matchAll(/<h3>([\s\S]*?)<\/h3>([\s\S]*?)(?=(?:<h3>|$))/gi);
      for (const fm of faqBlocks) {
        const question = stripHtml(fm[1]);
        const answerHtml = fm[2].trim();
        if (question) faq.push({ question, answerHtml });
      }
    }
  }

  // 7. Changelog extraction
  const changelog: ChangelogEntry[] = [];
  if (sectionBlocks.changelog) {
    for (const block of sectionBlocks.changelog) {
      const entries = block.matchAll(/<h3>([\s\S]*?)<\/h3>([\s\S]*?)(?=(?:<h3>|$))/gi);
      for (const em of entries) {
        const header = stripHtml(em[1]);
        const body = em[2].trim();

        const parts = header.split("|").map((s) => s.trim());
        const version = parts[0] || "";
        const date = parts[1] || null;

        if (!PATTERNS.version.test(version)) {
          warnings.push(`Malformed changelog version: "${version}" (expected vX.Y.Z)`);
        }
        if (date && !PATTERNS.date.test(date)) {
          warnings.push(`Malformed changelog date: "${date}" (expected YYYY-MM-DD)`);
        }

        const changes: string[] = [];
        const liMatches = body.matchAll(/<li>([\s\S]*?)<\/li>/gi);
        for (const lm of liMatches) {
          const text = stripHtml(lm[1]);
          if (text) changes.push(text);
        }

        changelog.push({
          version,
          date,
          changes,
          bodyHtml: body,
        });
      }
    }
  }

  // Sort changelogs descending by semver
  changelog.sort((a, b) => {
    const [majA, minA, patchA] = parseSemver(a.version);
    const [majB, minB, patchB] = parseSemver(b.version);
    if (majA !== majB) return majB - majA;
    if (minA !== minB) return minB - minA;
    return patchB - patchA;
  });

  const version = changelog.length > 0 ? changelog[0].version : null;
  const lastUpdated = changelog.length > 0 ? changelog[0].date : null;

  // 8. Reviews extraction
  const reviews: Review[] = [];
  if (sectionBlocks.reviews) {
    for (const block of sectionBlocks.reviews) {
      const revEntries = block.matchAll(/<h3>([\s\S]*?)<\/h3>([\s\S]*?)(?=(?:<h3>|$))/gi);
      for (const rm of revEntries) {
        const header = stripHtml(rm[1]);
        const body = rm[2].trim();

        const parts = header.split("|").map((s) => s.trim());
        const author = parts[0] || "Anonymous";
        const ratingNum = parseInt(parts[1] || "", 10);
        const rating =
          !isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5
            ? (ratingNum as 1 | 2 | 3 | 4 | 5)
            : null;
        const date = parts[2] || null;

        if (rating === null) {
          warnings.push(`Invalid rating in review for author "${author}": "${parts[1]}"`);
        }
        if (date && !PATTERNS.date.test(date)) {
          warnings.push(`Malformed review date: "${date}" (expected YYYY-MM-DD)`);
        }

        reviews.push({
          author,
          rating,
          date,
          bodyHtml: body,
        });
      }
    }
  }

  const reviewCount = reviews.length;
  const validRatings = reviews
    .map((r) => r.rating)
    .filter((r): r is 1 | 2 | 3 | 4 | 5 => r !== null);
  const averageRating =
    validRatings.length > 0
      ? Number((validRatings.reduce((acc, curr) => acc + curr, 0) / validRatings.length).toFixed(1))
      : null;

  return {
    descriptionHtml,
    features,
    compat,
    faq,
    reviews,
    changelog,
    version,
    lastUpdated,
    reviewCount,
    averageRating,
    warnings,
  };
}

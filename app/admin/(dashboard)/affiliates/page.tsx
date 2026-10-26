import { db } from "@/lib/db";
import { affiliateApplications } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AffiliatesTable } from "./AffiliatesTable";

export default async function AffiliatesAdminPage() {
  const applications = await db.select().from(affiliateApplications).orderBy(desc(affiliateApplications.createdAt));

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-[20px] font-semibold text-neutral-100 tracking-tight">Affiliate Queue</h1>
        <p className="text-[13px] text-neutral-400 mt-1">Review incoming partnership applications.</p>
      </div>

      <AffiliatesTable applications={applications} />
    </div>
  );
}

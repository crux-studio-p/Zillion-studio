import { getAdminUsers } from "@/lib/actions/user.actions";
import { getAdminSession } from "@/lib/auth/admin-auth";
import { UsersTable } from "./UsersTable";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const session = await getAdminSession(true);

  if (!session) {
    redirect("/admin/login");
  }

  const usersList = await getAdminUsers();

  return (
    <div className="max-w-6xl space-y-8 pb-20">
      <UsersTable
        users={usersList}
        currentUserId={session.userId}
        currentUserRole={session.role}
      />
    </div>
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar role={user.role} username={user.username || user.name} />
      <main className="ml-60 p-8 min-h-screen">{children}</main>
    </div>
  );
}

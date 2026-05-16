import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui/primitives";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  const profile = user.role === "RESEARCHER"
    ? await prisma.reputationProfile.findUnique({ where: { userId: user.id } })
    : null;

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { organization: true },
  });

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Manage your account" />

      <Card className="mb-6">
        <h2 className="font-semibold mb-4">Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted)]">Name</span>
            <span>{fullUser?.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted)]">Username</span>
            <span>{fullUser?.username}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted)]">Email</span>
            <span>{fullUser?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted)]">Role</span>
            <span>{fullUser?.role}</span>
          </div>
          {fullUser?.organization && (
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">Organization</span>
              <span>{fullUser.organization.name}</span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span className="text-[var(--muted)]">Member since</span>
            <span>{new Date(fullUser?.createdAt || "").toLocaleDateString()}</span>
          </div>
        </div>
      </Card>

      {profile && (
        <Card>
          <h2 className="font-semibold mb-4">Reputation</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-xl font-bold text-[var(--accent)]">{profile.overallScore?.toFixed(0)}</p>
              <p className="text-xs text-[var(--muted)]">Overall Score</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-xl font-bold">{profile.rank}</p>
              <p className="text-xs text-[var(--muted)]">Rank</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-xl font-bold text-green-400">{profile.validReports}/{profile.totalReports}</p>
              <p className="text-xs text-[var(--muted)]">Valid / Total Reports</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-xl font-bold text-yellow-400">{(profile.signalQuality * 100)?.toFixed(0)}%</p>
              <p className="text-xs text-[var(--muted)]">Signal Quality</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-xl font-bold text-red-400">{(profile.falsePositiveRate * 100)?.toFixed(1)}%</p>
              <p className="text-xs text-[var(--muted)]">False Positive Rate</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-xl font-bold text-blue-400">{(profile.severityAccuracy * 100)?.toFixed(0)}%</p>
              <p className="text-xs text-[var(--muted)]">Severity Accuracy</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

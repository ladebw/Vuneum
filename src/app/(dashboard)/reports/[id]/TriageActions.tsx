"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select } from "@/components/ui/primitives";
import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from "lucide-react";

const VALID_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["VIEWED", "UNDER_REVIEW", "NEEDS_MORE_INFO"],
  VIEWED: ["UNDER_REVIEW", "NEEDS_MORE_INFO", "CLOSED"],
  UNDER_REVIEW: ["NEEDS_MORE_INFO", "VALIDATED", "DUPLICATE_CLAIMED", "REJECTED"],
  NEEDS_MORE_INFO: ["UNDER_REVIEW", "VALIDATED", "REJECTED"],
  VALIDATED: ["ACCEPTED", "REJECTED"],
  DUPLICATE_CLAIMED: ["CLOSED"],
  ACCEPTED: ["CLOSED"],
  REJECTED: ["CLOSED"],
};

export default function TriageActions({
  reportId,
  currentStatus,
}: {
  reportId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const allowed = VALID_TRANSITIONS[currentStatus] || [];

  const handleStatusChange = async () => {
    if (!status) return;
    setLoading(true);

    const res = await fetch(`/api/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, timelineNote: note }),
    });

    if (res.ok) {
      router.refresh();
      setStatus("");
      setNote("");
    }
    setLoading(false);
  };

  const quickAction = async (newStatus: string) => {
    setLoading(true);
    const res = await fetch(`/api/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, timelineNote: `Quick action: ${newStatus.replace(/_/g, " ")}` }),
    });
    if (res.ok) router.refresh();
    setLoading(false);
  };

  if (allowed.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No transitions available from {currentStatus}.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {allowed.includes("VALIDATED") && (
          <Button size="sm" variant="primary" onClick={() => quickAction("VALIDATED")} disabled={loading}>
            <CheckCircle size={14} /> Validate
          </Button>
        )}
        {allowed.includes("ACCEPTED") && (
          <Button size="sm" variant="primary" onClick={() => quickAction("ACCEPTED")} disabled={loading}>
            <CheckCircle size={14} /> Accept
          </Button>
        )}
        {allowed.includes("REJECTED") && (
          <Button size="sm" variant="danger" onClick={() => quickAction("REJECTED")} disabled={loading}>
            <XCircle size={14} /> Reject
          </Button>
        )}
        {allowed.includes("NEEDS_MORE_INFO") && (
          <Button size="sm" variant="secondary" onClick={() => quickAction("NEEDS_MORE_INFO")} disabled={loading}>
            <AlertTriangle size={14} /> Need Info
          </Button>
        )}
        {allowed.includes("UNDER_REVIEW") && (
          <Button size="sm" variant="secondary" onClick={() => quickAction("UNDER_REVIEW")} disabled={loading}>
            <ArrowRight size={14} /> Start Review
          </Button>
        )}
      </div>

      {/* Custom transition */}
      <div className="border-t border-[var(--border)] pt-3">
        <p className="text-xs text-[var(--muted)] mb-2">Custom transition:</p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm mb-2"
        >
          <option value="">Select status...</option>
          {allowed.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Add a note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm mb-2"
        />
        <Button
          size="sm"
          className="w-full"
          onClick={handleStatusChange}
          disabled={!status || loading}
        >
          {loading ? "Updating..." : "Update Status"}
        </Button>
      </div>
    </div>
  );
}

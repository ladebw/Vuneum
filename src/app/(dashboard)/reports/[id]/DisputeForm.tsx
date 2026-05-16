"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, Textarea } from "@/components/ui/primitives";
import { AlertTriangle } from "lucide-react";

export default function DisputeForm({
  reportId,
  currentStatus,
}: {
  reportId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [disputeType, setDisputeType] = useState("");
  const [argument, setArgument] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <Button variant="danger" size="sm" className="w-full" onClick={() => setShow(true)}>
        <AlertTriangle size={14} /> Dispute This Decision
      </Button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, disputeType, researcherArgument: argument, isPublic }),
    });

    if (res.ok) {
      router.refresh();
      setShow(false);
    }
    setLoading(false);
  };

  const disputeTypeOptions = () => {
    if (currentStatus === "DUPLICATE_CLAIMED") return ["DUPLICATE_DECISION"];
    if (currentStatus === "ACCEPTED") return ["SEVERITY_DOWNGRADE", "PAYOUT_ISSUE"];
    if (currentStatus === "REJECTED") return ["INVALID_REJECTION"];
    return ["DUPLICATE_DECISION", "SEVERITY_DOWNGRADE", "INVALID_REJECTION", "PAYOUT_ISSUE"];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-semibold text-sm text-red-400">File a Dispute</h3>
      <Select
        value={disputeType}
        onChange={(e) => setDisputeType(e.target.value)}
      >
        <option value="">Select dispute reason...</option>
        {disputeTypeOptions().map((t) => (
          <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
        ))}
      </Select>
      <Textarea
        placeholder="Explain why you believe this decision is wrong. Provide specific evidence and reasoning."
        value={argument}
        onChange={(e) => setArgument(e.target.value)}
        rows={4}
      />
      <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        Make this dispute public
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!disputeType || argument.length < 20 || loading}>
          {loading ? "Filing..." : "Submit Dispute"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShow(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

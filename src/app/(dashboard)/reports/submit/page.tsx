"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, PageHeader, Button, Input, Textarea, Select } from "@/components/ui/primitives";
import { FileText } from "lucide-react";

export default function SubmitReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    vulnerabilityType: "",
    targetAsset: "",
    claimedSeverity: "MEDIUM",
    impact: "",
    stepsToReproduce: "",
    suggestedFix: "",
    disclosurePref: "COORDINATED",
    programId: searchParams.get("programId") || "",
    evidence: [] as { type: string; url: string; title: string }[],
  });

  useEffect(() => {
    fetch("/api/programs?status=PUBLIC")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPrograms(data);
      })
      .catch(() => {});
  }, []);

  const addEvidence = () => {
    setForm({
      ...form,
      evidence: [...form.evidence, { type: "SCREENSHOT", url: "", title: "" }],
    });
  };

  const updateEvidence = (idx: number, field: string, value: string) => {
    const updated = [...form.evidence];
    (updated[idx] as any)[field] = value;
    setForm({ ...form, evidence: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.programId) {
      setError("Please select a program.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Submission failed");
      setLoading(false);
      return;
    }

    router.push(`/reports/${data.id}`);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Submit Report" description="Submit a vulnerability report to a bounty program" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Card>
          <h2 className="font-semibold mb-4">Report Details</h2>
          <div className="space-y-4">
            <Select
              label="Program"
              value={form.programId}
              onChange={(e) => setForm({ ...form, programId: e.target.value })}
              required
            >
              <option value="">Select a program...</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
            <Input
              label="Title"
              placeholder="Brief description of the vulnerability"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              label="Target Asset"
              placeholder="e.g., https://api.example.com/v2/users"
              value={form.targetAsset}
              onChange={(e) => setForm({ ...form, targetAsset: e.target.value })}
              required
            />
            <Input
              label="Vulnerability Type"
              placeholder="e.g., IDOR, XSS, SQL Injection, SSRF..."
              value={form.vulnerabilityType}
              onChange={(e) => setForm({ ...form, vulnerabilityType: e.target.value })}
              required
            />
            <Select
              label="Claimed Severity"
              value={form.claimedSeverity}
              onChange={(e) => setForm({ ...form, claimedSeverity: e.target.value })}
            >
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFORMATIONAL">Informational</option>
            </Select>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Vulnerability Details</h2>
          <div className="space-y-4">
            <Textarea
              label="Impact"
              placeholder="Describe the impact of this vulnerability. What can an attacker do? What data is exposed? How many users are affected?"
              value={form.impact}
              onChange={(e) => setForm({ ...form, impact: e.target.value })}
              required
              rows={4}
            />
            <Textarea
              label="Steps to Reproduce"
              placeholder="Provide clear, step-by-step instructions to reproduce the vulnerability. Include exact URLs, request payloads, and expected vs. actual behavior."
              value={form.stepsToReproduce}
              onChange={(e) => setForm({ ...form, stepsToReproduce: e.target.value })}
              required
              rows={6}
            />
            <Textarea
              label="Suggested Fix (Optional)"
              placeholder="If you have suggestions for how to fix this vulnerability, include them here."
              value={form.suggestedFix}
              onChange={(e) => setForm({ ...form, suggestedFix: e.target.value })}
              rows={3}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Evidence</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Add links to screenshots, PoC videos, logs, or other evidence.
          </p>
          {form.evidence.map((ev, idx) => (
            <div key={idx} className="flex gap-3 mb-3">
              <select
                value={ev.type}
                onChange={(e) => updateEvidence(idx, "type", e.target.value)}
                className="w-32 px-2 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-xs"
              >
                <option value="SCREENSHOT">Screenshot</option>
                <option value="VIDEO">Video</option>
                <option value="LOG_FILE">Log</option>
                <option value="POC_CODE">PoC Code</option>
                <option value="NETWORK_CAPTURE">PCAP</option>
                <option value="OTHER">Other</option>
              </select>
              <input
                type="text"
                placeholder="Title"
                value={ev.title}
                onChange={(e) => updateEvidence(idx, "title", e.target.value)}
                className="flex-1 px-2 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-xs"
              />
              <input
                type="url"
                placeholder="https://..."
                value={ev.url}
                onChange={(e) => updateEvidence(idx, "url", e.target.value)}
                className="flex-1 px-2 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-xs"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addEvidence}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            + Add Evidence
          </button>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Disclosure Preference</h2>
          <Select
            value={form.disclosurePref}
            onChange={(e) => setForm({ ...form, disclosurePref: e.target.value })}
          >
            <option value="COORDINATED">Coordinated Disclosure (recommended)</option>
            <option value="FULL">Full Disclosure</option>
            <option value="NONE">No Disclosure</option>
          </Select>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </div>
  );
}

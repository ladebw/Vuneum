import Link from "next/link";
import { Shield, Users, FileText, DollarSign, BarChart3, ArrowRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-[var(--accent)]">Vun</span>
            <span>eum</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-8">
          <Shield size={16} />
          Researcher-First Bounty Platform
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Fair Bounties.
          <br />
          <span className="text-[var(--accent)]">Transparent Triage.</span>
          <br />
          Proven Results.
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-10">
          Vuneum is the bounty platform where researchers get fair treatment, transparent decisions,
          duplicate proof, and aligned incentives. We only earn when you get paid.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            Join as Researcher <ArrowRight size={18} />
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg bg-white/5 text-[var(--foreground)] font-medium hover:bg-white/10 transition-colors"
          >
            Launch a Program
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <FileText size={24} />,
            title: "Evidence-Based Reports",
            desc: "Submit with structured evidence. Every report gets a fair, documented review.",
          },
          {
            icon: <CheckCircle size={24} />,
            title: "Transparent Duplicates",
            desc: "Every duplicate requires root cause proof, comparison, and reasoning — not a silent close.",
          },
          {
            icon: <DollarSign size={24} />,
            title: "Aligned Payouts",
            desc: "Platform fee only applies when you get paid. Researcher-first economics.",
          },
          {
            icon: <BarChart3 size={24} />,
            title: "Public Metrics",
            desc: "Real stats on every program: response time, duplicate rate, total paid. No hiding.",
          },
          {
            icon: <Users size={24} />,
            title: "Meaningful Reputation",
            desc: "Based on signal quality and severity accuracy. No fake gamified points.",
          },
          {
            icon: <Shield size={24} />,
            title: "Dispute Rights",
            desc: "Challenge duplicate decisions, downgrades, and rejections with documented review.",
          },
        ].map((f, i) => (
          <div key={i} className="glass p-6 hover:border-[var(--accent)]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-4">
              {f.icon}
            </div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-[var(--muted)]">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="glass p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to join the fair bounty movement?</h2>
          <p className="text-[var(--muted)] mb-8 max-w-lg mx-auto">
            Whether you hunt bugs or run a security program, Vuneum gives you the transparency and fairness you deserve.
          </p>
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--muted)]">
        <p>Vuneum &copy; {new Date().getFullYear()} &mdash; Researcher-First Bounty Platform</p>
      </footer>
    </div>
  );
}

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Vuneum database...");

  const passwordHash = await hash("password123", 12);

  // ─── Users ────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { email: "admin@vuneum.io" },
    update: {},
    create: {
      email: "admin@vuneum.io",
      username: "admin",
      name: "Platform Admin",
      passwordHash,
      role: "ADMIN",
      bio: "Vuneum platform administrator",
    },
  });

  const triager = await prisma.user.upsert({
    where: { email: "triager@vuneum.io" },
    update: {},
    create: {
      email: "triager@vuneum.io",
      username: "triager",
      name: "Sarah Triager",
      passwordHash,
      role: "TRIAGER",
      bio: "Senior security triager",
    },
  });

  const researcher1 = await prisma.user.upsert({
    where: { email: "researcher@vuneum.io" },
    update: {},
    create: {
      email: "researcher@vuneum.io",
      username: "bugslayer",
      name: "Alex Bugslayer",
      passwordHash,
      role: "RESEARCHER",
      bio: "Full-time bug bounty hunter. 5+ years experience.",
      website: "https://bugslayer.dev",
      twitterHandle: "@bugslayer",
    },
  });

  const researcher2 = await prisma.user.upsert({
    where: { email: "researcher2@vuneum.io" },
    update: {},
    create: {
      email: "researcher2@vuneum.io",
      username: "zer0day",
      name: "Zero Day",
      passwordHash,
      role: "RESEARCHER",
      bio: "Security researcher focused on web application security.",
    },
  });

  // ─── Organization & Company ───────────────────────────────

  const acmeCorp = await prisma.user.upsert({
    where: { email: "security@acmecorp.com" },
    update: {},
    create: {
      email: "security@acmecorp.com",
      username: "acme-security",
      name: "ACME Corp Security",
      passwordHash,
      role: "COMPANY",
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "ACME Corporation",
      slug: "acme-corp",
      description: "A leading technology company specializing in cloud infrastructure and enterprise software.",
      website: "https://acmecorp.example.com",
      verified: true,
    },
  });

  await prisma.user.update({
    where: { id: acmeCorp.id },
    data: { organizationId: org.id },
  });

  // ─── Program ──────────────────────────────────────────────

  const program = await prisma.program.upsert({
    where: { slug: "acme-cloud-platform" },
    update: {},
    create: {
      title: "ACME Cloud Platform",
      slug: "acme-cloud-platform",
      description: "Our flagship cloud platform. We take security seriously and reward researchers who help us find and fix vulnerabilities before they can be exploited.",
      fullPolicy: `# ACME Cloud Platform Bug Bounty Program

## Program Overview
ACME Corp values the security community's contributions to making our platform safer. This program outlines the rules, rewards, and expectations for security researchers.

## Safe Harbor
ACME Corp will not pursue legal action against researchers who comply with this policy. We consider vulnerability research conducted in good faith to be authorized.

## Disclosure Policy
We follow a coordinated disclosure policy. Please allow us 90 days to remediate before public disclosure.

## Out of Scope
- Denial of Service attacks
- Physical security testing
- Social engineering
- SPF/DKIM/DMARC issues without demonstrated email forgery`,
      visibility: "PUBLIC",
      status: "PUBLIC",
      minSeverity: "LOW",
      maxPayout: 15000,
      minPayout: 100,
      platformFeePct: 15,
      disclosurePolicy: "COORDINATED",
      ownerId: acmeCorp.id,
      organizationId: org.id,
    },
  });

  // ─── Scope Assets ─────────────────────────────────────────

  const assets = [
    { assetType: "DOMAIN" as const, identifier: "*.acmecorp.example.com", description: "All subdomains", inScope: true },
    { assetType: "URL_PREFIX" as const, identifier: "https://api.acmecorp.example.com/v2/", description: "API v2", inScope: true },
    { assetType: "URL_PREFIX" as const, identifier: "https://app.acmecorp.example.com/", description: "Web application", inScope: true },
    { assetType: "MOBILE_APP" as const, identifier: "com.acmecorp.mobile", description: "Android App", inScope: true },
    { assetType: "API_ENDPOINT" as const, identifier: "https://api.acmecorp.example.com/v1/", description: "Legacy API - Out of scope", inScope: false },
  ];

  for (const asset of assets) {
    await prisma.scopeAsset.upsert({
      where: { id: `${program.id}-${asset.identifier}` },
      update: {},
      create: { ...asset, programId: program.id },
    });
  }

  // ─── Reward Tiers ─────────────────────────────────────────

  const tiers = [
    { severity: "CRITICAL" as const, minAmount: 5000, maxAmount: 15000, description: "Remote code execution, full system compromise" },
    { severity: "HIGH" as const, minAmount: 2000, maxAmount: 5000, description: "Authentication bypass, sensitive data exposure" },
    { severity: "MEDIUM" as const, minAmount: 500, maxAmount: 2000, description: "CSRF, XSS with impact, IDOR" },
    { severity: "LOW" as const, minAmount: 100, maxAmount: 500, description: "Minor information disclosure, missing security headers" },
  ];

  for (const tier of tiers) {
    await prisma.rewardTier.upsert({
      where: { programId_severity: { programId: program.id, severity: tier.severity } },
      update: {},
      create: { ...tier, programId: program.id },
    });
  }

  // ─── Transparency Metrics ─────────────────────────────────

  await prisma.transparencyMetric.upsert({
    where: { programId: program.id },
    update: {},
    create: {
      programId: program.id,
      avgFirstResponseHours: 4.5,
      avgTriageHours: 24,
      duplicateRate: 12,
      rejectionRate: 18,
      totalPaid: 25000,
      validReportCount: 12,
      totalReportCount: 28,
    },
  });

  // ─── Reputation Profile ───────────────────────────────────

  await prisma.reputationProfile.upsert({
    where: { userId: researcher1.id },
    update: {},
    create: {
      userId: researcher1.id,
      validReports: 15,
      totalReports: 20,
      pocQualityScore: 85,
      disputeSuccessRate: 0.67,
      severityAccuracy: 0.8,
      signalQuality: 0.75,
      falsePositiveRate: 0.2,
      overallScore: 72.5,
      rank: "Platinum",
    },
  });

  await prisma.reputationProfile.upsert({
    where: { userId: researcher2.id },
    update: {},
    create: {
      userId: researcher2.id,
      validReports: 8,
      totalReports: 12,
      pocQualityScore: 70,
      signalQuality: 0.67,
      falsePositiveRate: 0.33,
      overallScore: 55,
      rank: "Gold",
    },
  });

  // ─── Sample Report ────────────────────────────────────────

  const sampleReport = await prisma.report.upsert({
    where: { id: "sample-report-001" },
    update: {},
    create: {
      id: "sample-report-001",
      title: "IDOR in User Profile API allows unauthorized access to other users' PII",
      vulnerabilityType: "IDOR",
      targetAsset: "https://api.acmecorp.example.com/v2/users/{id}/profile",
      claimedSeverity: "HIGH",
      impact: "An attacker can enumerate user IDs and access private profile information of any user on the platform, including email addresses, phone numbers, and physical addresses. This affects approximately 50,000 users.",
      stepsToReproduce: "1. Log in as a regular user\n2. Navigate to your own profile: GET /v2/users/me/profile\n3. Note the numeric user ID returned in the response\n4. Replace your ID with another user's ID: GET /v2/users/1234/profile\n5. Observe that the API returns the other user's full profile data without authorization check",
      suggestedFix: "Implement server-side ownership verification. Each profile request should verify that the requesting user owns the requested profile or has admin privileges.",
      status: "SUBMITTED",
      reporterId: researcher1.id,
      programId: program.id,
    },
  });

  // Timeline event for sample report
  await prisma.reportTimelineEvent.upsert({
    where: { id: "sample-timeline-001" },
    update: {},
    create: {
      id: "sample-timeline-001",
      reportId: sampleReport.id,
      userId: researcher1.id,
      eventType: "SUBMITTED",
      newValue: JSON.stringify({ status: "SUBMITTED" }),
      notes: "Report submitted by researcher",
    },
  });

  console.log("✅ Seed complete!");
  console.log("");
  console.log("Login credentials (all use password: password123):");
  console.log("  Admin:      admin@vuneum.io");
  console.log("  Triager:    triager@vuneum.io");
  console.log("  Researcher: researcher@vuneum.io");
  console.log("  Company:    security@acmecorp.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  name: z.string().min(1, "Name is required").max(100),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["RESEARCHER", "COMPANY"]),
  organizationName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const programSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  fullPolicy: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  status: z.enum(["DRAFT", "PRIVATE", "PUBLIC", "PAUSED", "CLOSED"]),
  minSeverity: z.enum(["NONE", "INFORMATIONAL", "LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  maxPayout: z.number().optional(),
  minPayout: z.number().optional(),
  platformFeePct: z.number().min(0).max(100).default(15),
  disclosurePolicy: z.enum(["NONE", "COORDINATED", "FULL"]),
  organizationId: z.string().optional(),
});

export const reportSchema = z.object({
  title: z.string().min(5).max(300),
  vulnerabilityType: z.string().min(1),
  targetAsset: z.string().min(1),
  claimedSeverity: z.enum(["NONE", "INFORMATIONAL", "LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  impact: z.string().min(20),
  stepsToReproduce: z.string().min(20),
  suggestedFix: z.string().optional(),
  disclosurePref: z.enum(["NONE", "COORDINATED", "FULL"]),
  programId: z.string().min(1),
  evidence: z.array(z.object({
    type: z.enum(["SCREENSHOT", "LOG_FILE", "VIDEO", "POC_CODE", "NETWORK_CAPTURE", "OTHER"]),
    url: z.string(),
    title: z.string().optional(),
  })).optional(),
});

export const duplicateClaimSchema = z.object({
  duplicateReportId: z.string().min(1),
  rootCauseExplanation: z.string().min(20, "Must provide a detailed root cause explanation"),
  assetComparison: z.string().min(10, "Must compare affected assets"),
  impactOverlapComparison: z.string().min(10, "Must compare impact overlap"),
  firstSubmissionComparison: z.string().min(10, "Must compare submission timestamps"),
  triagerReasoning: z.string().min(20, "Must provide triager reasoning"),
});

export const disputeSchema = z.object({
  reportId: z.string().min(1),
  disputeType: z.enum(["DUPLICATE_DECISION", "SEVERITY_DOWNGRADE", "INVALID_REJECTION", "PAYOUT_ISSUE"]),
  researcherArgument: z.string().min(20, "Must provide a detailed argument"),
  isPublic: z.boolean().default(false),
});

export const disputeResponseSchema = z.object({
  triagerResponse: z.string().min(10),
  finalDecision: z.string().min(10),
  isPublic: z.boolean().default(false),
});

export const payoutSchema = z.object({
  reportId: z.string().min(1),
  rewardAmount: z.number().positive(),
  platformFeePct: z.number().min(0).max(100).default(15),
});

export const scopeAssetSchema = z.object({
  assetType: z.enum(["DOMAIN", "WILDCARD_DOMAIN", "IP_RANGE", "URL_PREFIX", "MOBILE_APP", "API_ENDPOINT", "CLOUD_ASSET", "OTHER"]),
  identifier: z.string().min(1),
  description: z.string().optional(),
  inScope: z.boolean().default(true),
});

export const rewardTierSchema = z.object({
  severity: z.enum(["NONE", "INFORMATIONAL", "LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0),
  description: z.string().optional(),
});

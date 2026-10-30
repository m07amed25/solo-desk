// Synthetic preview facts and public site definitions only; never a projection of an account or a billing claim.

export type AvailabilityStatus = "available" | "inDevelopment" | "planned";

export interface CapabilityAreaDefinition {
  readonly id: "clients" | "projects" | "time" | "invoices" | "insights";
  readonly status: AvailabilityStatus;
  readonly iconName: string;
  readonly detailCount: number;
}

export interface FeatureDefinition {
  readonly id:
    | "shortcuts"
    | "timer"
    | "saveStatus"
    | "multiCurrency"
    | "taxDiscount"
    | "workspaces"
    | "bilingual"
    | "themes";
  readonly status: AvailabilityStatus;
  readonly areaId:
    "clients" | "projects" | "time" | "invoices" | "insights" | "platform";
  readonly iconName: string;
}

export interface JourneyStepDefinition {
  readonly step: number;
  readonly id: "account" | "setup" | "track" | "invoice";
  readonly status: AvailabilityStatus;
}

export interface PrincipleDefinition {
  readonly id: "exactness" | "speed" | "transparency" | "privacy";
  readonly iconName: string;
}

export interface FaqDefinition {
  readonly id:
    | "availability"
    | "dataOwnership"
    | "privacy"
    | "languages"
    | "devices"
    | "teams"
    | "pricing"
    | "auth";
}

export interface AudienceProfileDefinition {
  readonly id: "freelance" | "consultant" | "agency";
  readonly iconName: string;
}

export interface SecurityCommitmentDefinition {
  readonly id: "noTrackers" | "tenantIsolation" | "encryption" | "disclaimer";
  readonly iconName: string;
}

export interface HeroHighlightDefinition {
  readonly id: "multiCurrency" | "recoverableTime" | "bilingual";
  readonly iconName: string;
}

// 1. Core Capability Areas (Product Tour)
export const capabilityAreas: readonly CapabilityAreaDefinition[] = [
  { id: "clients", status: "inDevelopment", iconName: "Users", detailCount: 4 },
  {
    id: "projects",
    status: "inDevelopment",
    iconName: "FolderKanban",
    detailCount: 4,
  },
  { id: "time", status: "inDevelopment", iconName: "Clock3", detailCount: 4 },
  {
    id: "invoices",
    status: "inDevelopment",
    iconName: "FileText",
    detailCount: 4,
  },
  { id: "insights", status: "planned", iconName: "TrendingUp", detailCount: 4 },
] as const;

// 2. Detailed Technical Features Grid
export const featureGrid: readonly FeatureDefinition[] = [
  {
    id: "shortcuts",
    status: "planned",
    areaId: "platform",
    iconName: "Command",
  },
  { id: "timer", status: "inDevelopment", areaId: "time", iconName: "Timer" },
  {
    id: "saveStatus",
    status: "available",
    areaId: "platform",
    iconName: "CloudCheck",
  },
  {
    id: "multiCurrency",
    status: "inDevelopment",
    areaId: "invoices",
    iconName: "Coins",
  },
  {
    id: "taxDiscount",
    status: "planned",
    areaId: "invoices",
    iconName: "Percent",
  },
  {
    id: "workspaces",
    status: "planned",
    areaId: "platform",
    iconName: "Building2",
  },
  {
    id: "bilingual",
    status: "available",
    areaId: "platform",
    iconName: "Languages",
  },
  {
    id: "themes",
    status: "available",
    areaId: "platform",
    iconName: "SunMoon",
  },
] as const;

// 3. Workflow Journey Steps (How It Works)
export const journeySteps: readonly JourneyStepDefinition[] = [
  { step: 1, id: "account", status: "available" },
  { step: 2, id: "setup", status: "inDevelopment" },
  { step: 3, id: "track", status: "inDevelopment" },
  { step: 4, id: "invoice", status: "inDevelopment" },
] as const;

// 4. Foundational Principles (Why SoloDesk)
export const principles: readonly PrincipleDefinition[] = [
  { id: "exactness", iconName: "Calculator" },
  { id: "speed", iconName: "Zap" },
  { id: "transparency", iconName: "RefreshCw" },
  { id: "privacy", iconName: "ShieldCheck" },
] as const;

// 5. Frequently Asked Questions
export const faqItems: readonly FaqDefinition[] = [
  { id: "availability" },
  { id: "dataOwnership" },
  { id: "privacy" },
  { id: "languages" },
  { id: "devices" },
  { id: "teams" },
  { id: "pricing" },
  { id: "auth" },
] as const;

// 6. Audience Profiles
export const audienceProfiles: readonly AudienceProfileDefinition[] = [
  { id: "freelance", iconName: "Code2" },
  { id: "consultant", iconName: "Briefcase" },
  { id: "agency", iconName: "Users2" },
] as const;

// 7. Hero Highlights
export const heroHighlights: readonly HeroHighlightDefinition[] = [
  { id: "multiCurrency", iconName: "Coins" },
  { id: "recoverableTime", iconName: "Clock3" },
  { id: "bilingual", iconName: "Languages" },
] as const;

// 8. Plain-Language Privacy & Security Commitments
export const securityCommitments: readonly SecurityCommitmentDefinition[] = [
  { id: "noTrackers", iconName: "EyeOff" },
  { id: "tenantIsolation", iconName: "Lock" },
  { id: "encryption", iconName: "ShieldCheck" },
  { id: "disclaimer", iconName: "Check" },
] as const;

// Synthetic preview datasets (strictly isolated with <bdi> where numeric)
export const previewProjects = [
  { name: "studio", status: "inProgress", hours: 12, minutes: 30 },
  { name: "api", status: "ready", hours: 8, minutes: 15 },
  { name: "review", status: "planned", hours: 2, minutes: 0 },
] as const;

export const previewTasks = [
  { name: "taskOne", done: true },
  { name: "taskTwo", done: true },
  { name: "taskThree", done: false },
] as const;

export const previewInvoiceAmount = 1250;

export const previewClients = [
  { name: "North Studio", activeProjects: 2, currency: "USD", totalHours: 42 },
  { name: "Apex Labs", activeProjects: 1, currency: "EUR", totalHours: 18 },
  { name: "Acme Cloud", activeProjects: 3, currency: "USD", totalHours: 75 },
] as const;

export const previewInsights = {
  monthlyHours: 135,
  billableRatio: "94%",
  activeProjects: 4,
  invoicedYTD: 24500,
} as const;

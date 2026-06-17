import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  real,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const prospectStatusEnum = pgEnum("prospect_status", [
  "imported",
  "enriched",
  "sequenced",
  "pushed",
  "replied_positive",
  "replied_negative",
  "unsubscribed",
]);

export const emailStatusEnum = pgEnum("email_status", [
  "draft",
  "approved",
  "sent",
  "paused",
]);

export const sequenceStatusEnum = pgEnum("sequence_status", [
  "draft",
  "approved",
  "active",
  "completed",
  "paused",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "email_sent",
  "email_opened",
  "email_clicked",
  "email_replied",
  "unsubscribed",
  "bounced",
]);

export const replyClassificationEnum = pgEnum("reply_classification", [
  "positive",
  "negative",
  "out_of_office",
  "unsubscribe",
  "neutral",
  "unclassified",
]);

export const variantTypeEnum = pgEnum("variant_type", [
  "subject",
  "cta",
  "body",
]);

export const icpTierEnum = pgEnum("icp_tier", ["A", "B", "C"]);

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  instantlyApiKey: text("instantly_api_key"),
  anthropicApiKey: text("anthropic_api_key"),
  slackWebhookUrl: text("slack_webhook_url"),
  sendingDomain: text("sending_domain"),
  spendCapWeeklyUsd: real("spend_cap_weekly_usd").default(500),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Context docs ─────────────────────────────────────────────────────────────

export const contextDocs = pgTable("context_docs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull(), // 'pdf' | 'url' | 'text'
  sourceUrl: text("source_url"),
  rawText: text("raw_text").notNull(),
  embedded: boolean("embedded").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// context_chunks is added when pgvector extension is available
// stored as real[] for now — swap to vector(1536) after enabling pgvector
export const contextChunks = pgTable("context_chunks", {
  id: uuid("id").defaultRandom().primaryKey(),
  docId: uuid("doc_id")
    .references(() => contextDocs.id, { onDelete: "cascade" })
    .notNull(),
  chunkText: text("chunk_text").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  // embedding stored as JSON array until pgvector is confirmed available
  embeddingJson: jsonb("embedding_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Campaigns ────────────────────────────────────────────────────────────────

export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  instantlyCampaignId: text("instantly_campaign_id"),
  status: text("status").default("draft").notNull(), // draft | active | paused | completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Prospects ────────────────────────────────────────────────────────────────

export const prospects = pgTable("prospects", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  company: text("company").notNull(),
  title: text("title").notNull(),
  industry: text("industry").notNull(),
  linkedinUrl: text("linkedin_url"),
  // enrichment_json holds: { icp_tier, assumed_okrs, pain_points, personalization_hooks }
  enrichmentJson: jsonb("enrichment_json"),
  icpTier: icpTierEnum("icp_tier"),
  status: prospectStatusEnum("status").default("imported").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Sequences ────────────────────────────────────────────────────────────────

export const sequences = pgTable("sequences", {
  id: uuid("id").defaultRandom().primaryKey(),
  prospectId: uuid("prospect_id")
    .references(() => prospects.id, { onDelete: "cascade" })
    .notNull(),
  campaignId: uuid("campaign_id")
    .references(() => campaigns.id)
    .notNull(),
  status: sequenceStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Emails ───────────────────────────────────────────────────────────────────

export const emails = pgTable("emails", {
  id: uuid("id").defaultRandom().primaryKey(),
  sequenceId: uuid("sequence_id")
    .references(() => sequences.id, { onDelete: "cascade" })
    .notNull(),
  step: integer("step").notNull(), // 1–5
  delayDays: integer("delay_days").notNull(), // days after previous step
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  cta: text("cta").notNull(),
  status: emailStatusEnum("status").default("draft").notNull(),
  // which variant was actually sent (set at push time)
  sentSubjectVariant: text("sent_subject_variant"), // 'a' | 'b'
  sentCtaVariant: text("sent_cta_variant"), // 'short' | 'long'
  sentBodyVariant: text("sent_body_variant"), // 'original' | 'short'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── A/B Variants ─────────────────────────────────────────────────────────────

export const abVariants = pgTable("ab_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  emailId: uuid("email_id")
    .references(() => emails.id, { onDelete: "cascade" })
    .notNull(),
  variantType: variantTypeEnum("variant_type").notNull(),
  valueA: text("value_a").notNull(),
  valueB: text("value_b").notNull(),
  sendsA: integer("sends_a").default(0).notNull(),
  sendsB: integer("sends_b").default(0).notNull(),
  opensA: integer("opens_a").default(0).notNull(),
  opensB: integer("opens_b").default(0).notNull(),
  repliesA: integer("replies_a").default(0).notNull(),
  repliesB: integer("replies_b").default(0).notNull(),
  winner: text("winner"), // 'a' | 'b' | null (inconclusive)
  confidencePct: real("confidence_pct"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Events ───────────────────────────────────────────────────────────────────

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  prospectId: uuid("prospect_id").references(() => prospects.id),
  emailId: uuid("email_id").references(() => emails.id),
  eventType: eventTypeEnum("event_type").notNull(),
  replyText: text("reply_text"),
  replyClassification: replyClassificationEnum("reply_classification").default(
    "unclassified"
  ),
  classificationConfidence: real("classification_confidence"),
  classificationReasoning: text("classification_reasoning"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
});

// ─── Landing pages ────────────────────────────────────────────────────────────

export const landingPages = pgTable("landing_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  prospectId: uuid("prospect_id")
    .references(() => prospects.id, { onDelete: "cascade" })
    .notNull(),
  slug: text("slug").notNull().unique(),
  headline: text("headline").notNull(),
  valueProps: jsonb("value_props").notNull(), // string[]
  roiEstimate: text("roi_estimate"),
  ctaText: text("cta_text").notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Spend log ────────────────────────────────────────────────────────────────

export const spendLog = pgTable("spend_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  prospectId: uuid("prospect_id").references(() => prospects.id),
  operation: text("operation").notNull(), // 'enrich' | 'generate_sequence' | 'generate_variants' | 'generate_landing_page' | 'classify_reply' | 'ab_optimize'
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  costUsd: real("cost_usd").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Prompt learnings ─────────────────────────────────────────────────────────

export const promptLearnings = pgTable("prompt_learnings", {
  id: uuid("id").defaultRandom().primaryKey(),
  weekStart: timestamp("week_start").notNull(),
  insights: jsonb("insights").notNull(), // string[]
  promptAdditions: text("prompt_additions"),
  dropThese: jsonb("drop_these"), // string[]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

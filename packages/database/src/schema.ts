import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash"),
  displayName: varchar("display_name", { length: 120 }).notNull(),
  role: varchar("role", { length: 30 }).default("USER").notNull(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  refreshTokenHash: varchar("refresh_token_hash", { length: 128 }).notNull().unique(),
  deviceId: uuid("device_id"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }).defaultNow().notNull(),
});

export const devices = pgTable("devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  platform: varchar("platform", { length: 30 }).notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
  pushToken: varchar("push_token", { length: 512 }),
  pushTokenUpdatedAt: timestamp("push_token_updated_at", { withTimezone: true }),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
});

export const highlights = pgTable("highlights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  versionId: integer("version_id").notNull(),
  reference: varchar("reference", { length: 80 }).notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, t => ({ ownerReference: uniqueIndex("highlights_owner_reference_idx").on(t.userId, t.versionId, t.reference) }));

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  versionId: integer("version_id"),
  reference: varchar("reference", { length: 80 }),
  title: varchar("title", { length: 200 }),
  body: text("body").notNull(),
  isPrivate: boolean("is_private").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  versionId: integer("version_id").notNull(),
  reference: varchar("reference", { length: 80 }).notNull(),
  label: varchar("label", { length: 120 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const readingHistory = pgTable("reading_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  versionId: integer("version_id").notNull(),
  reference: varchar("reference", { length: 80 }).notNull(),
  progress: integer("progress").default(0).notNull(),
  lastReadAt: timestamp("last_read_at", { withTimezone: true }).defaultNow().notNull(),
});

export const syncOperations = pgTable("sync_operations", {
  id: uuid("id").defaultRandom().primaryKey(),
  operationId: varchar("operation_id", { length: 120 }).notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceId: uuid("device_id").notNull().references(() => devices.id, { onDelete: "cascade" }),
  entity: varchar("entity", { length: 60 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  operation: varchar("operation", { length: 20 }).notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bibleVerses = pgTable("bible_verses", {
  id: uuid("id").defaultRandom().primaryKey(),
  versionId: integer("version_id").notNull(),
  bookId: varchar("book_id", { length: 3 }).notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  reference: varchar("reference", { length: 80 }).notNull(),
  text: text("text").notNull(),
  searchText: text("search_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, t => ({
  versionReference: uniqueIndex("bible_verses_version_reference_idx").on(t.versionId, t.reference),
}));

export const bibleVersions = pgTable("bible_versions", {
  id: integer("id").primaryKey(),
  abbreviation: varchar("abbreviation", { length: 30 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  languageTag: varchar("language_tag", { length: 35 }).notNull(),
  copyright: text("copyright"),
  publisherUrl: text("publisher_url"),
  licensedForApp: boolean("licensed_for_app").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 120 }).notNull(),
  resourceType: varchar("resource_type", { length: 80 }),
  resourceId: varchar("resource_id", { length: 120 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const readingPlans = pgTable("reading_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  totalDays: integer("total_days").notNull(),
  visibility: varchar("visibility", { length: 20 }).default("PRIVATE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const readingPlanDays = pgTable("reading_plan_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id").notNull().references(() => readingPlans.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  title: varchar("title", { length: 160 }),
  passages: jsonb("passages").notNull(),
}, t => ({ uniqueDay: uniqueIndex("reading_plan_days_plan_day_idx").on(t.planId, t.dayNumber) }));

export const readingPlanEnrollments = pgTable("reading_plan_enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id").notNull().references(() => readingPlans.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, t => ({ enrollmentUnique: uniqueIndex("reading_plan_enrollments_plan_user_idx").on(t.planId, t.userId) }));

export const readingPlanProgress = pgTable("reading_plan_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id").notNull().references(() => readingPlans.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, t => ({ progressUnique: uniqueIndex("reading_plan_progress_plan_user_day_idx").on(t.planId, t.userId, t.dayNumber) }));

export const prayers = pgTable("prayers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  tags: jsonb("tags").default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const prayerUpdates = pgTable("prayer_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  prayerId: uuid("prayer_id").notNull().references(() => prayers.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});


export const aiConversations = pgTable("ai_conversations", { id: uuid("id").defaultRandom().primaryKey(), userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), title: varchar("title", { length: 200 }).notNull(), mode: varchar("mode", { length: 40 }).notNull(), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(), updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull() });
export const aiMessages = pgTable("ai_messages", { id: uuid("id").defaultRandom().primaryKey(), conversationId: uuid("conversation_id").notNull().references(() => aiConversations.id, { onDelete: "cascade" }), role: varchar("role", { length: 20 }).notNull(), content: text("content").notNull(), metadata: jsonb("metadata"), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull() });
export const aiCitations = pgTable("ai_citations", { id: uuid("id").defaultRandom().primaryKey(), messageId: uuid("message_id").notNull().references(() => aiMessages.id, { onDelete: "cascade" }), versionId: integer("version_id").notNull(), reference: varchar("reference", { length: 80 }).notNull(), quote: varchar("quote", { length: 600 }), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull() });


export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  visibility: varchar("visibility", { length: 20 }).default("PRIVATE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const groupMembers = pgTable("group_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).default("MEMBER").notNull(),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
}, t => ({ uniqueMembership: uniqueIndex("group_members_group_user_idx").on(t.groupId, t.userId) }));

export const groupPosts = pgTable("group_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  authorUserId: uuid("author_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  postType: varchar("post_type", { length: 30 }).default("DISCUSSION").notNull(),
  reference: varchar("reference", { length: 80 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const groupComments = pgTable("group_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").notNull().references(() => groupPosts.id, { onDelete: "cascade" }),
  authorUserId: uuid("author_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const communityReports = pgTable("community_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterUserId: uuid("reporter_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }),
  postId: uuid("post_id").references(() => groupPosts.id, { onDelete: "cascade" }),
  commentId: uuid("comment_id").references(() => groupComments.id, { onDelete: "cascade" }),
  reason: varchar("reason", { length: 40 }).notNull(),
  details: text("details"),
  status: varchar("status", { length: 20 }).default("OPEN").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  data: jsonb("data"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});


export const aiJobs = pgTable("ai_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  conversationId: uuid("conversation_id").references(() => aiConversations.id, { onDelete: "set null" }),
  status: varchar("status", { length: 20 }).default("QUEUED").notNull(),
  input: jsonb("input").notNull(),
  result: jsonb("result"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

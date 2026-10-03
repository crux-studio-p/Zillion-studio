import { pgTable, text, timestamp, boolean, varchar, uuid, pgEnum, integer } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('role', ['SuperAdmin', 'Admin', 'Editor', 'Support', 'Developer']);
export const statusEnum = pgEnum('status', ['Draft', 'Published']);
export const reviewStatusEnum = pgEnum('review_status', ['Pending', 'Approved', 'Rejected']);
export const affiliateStatusEnum = pgEnum('affiliate_status', ['Pending', 'Approved', 'Rejected']);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: roleEnum("role").default("Support").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  status: statusEnum("status").default("Draft").notNull(),
  authorId: uuid("author_id").references(() => users.id),
  featuredImage: text("featured_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  tebexPackageId: varchar("tebex_package_id", { length: 100 }), // null = global review
  name: varchar("name", { length: 255 }).notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull(),
  status: reviewStatusEnum("status").default("Pending").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const affiliateApplications = pgTable("affiliate_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  discordName: varchar("discord_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  communityName: varchar("community_name", { length: 255 }),
  reach: varchar("reach", { length: 255 }),
  walletId: varchar("wallet_id", { length: 255 }).notNull(),
  socialLinks: text("social_links").notNull(),
  experience: text("experience").notNull(),
  whyResell: text("why_resell").notNull(),
  couponSplit: varchar("coupon_split", { length: 255 }).notNull(),
  preferredCodeName: varchar("preferred_code_name", { length: 255 }),
  additionalInfo: text("additional_info"),
  status: affiliateStatusEnum("status").default("Pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

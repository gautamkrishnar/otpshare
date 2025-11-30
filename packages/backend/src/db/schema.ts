import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull(),
  dark_mode: integer('dark_mode', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updated_at: text('updated_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export const otps = sqliteTable(
  'otps',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull(),
    status: text('status', { enum: ['used', 'unused'] })
      .notNull()
      .default('unused'),
    created_at: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
    created_by: integer('created_by')
      .notNull()
      .references(() => users.id),
    used_at: text('used_at'),
    used_by: integer('used_by').references(() => users.id),
  },
  (table) => {
    return {
      statusIdx: index('idx_otps_status').on(table.status),
      createdAtIdx: index('idx_otps_created_at').on(table.created_at),
    };
  },
);

export const usage_logs = sqliteTable(
  'usage_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    otp_id: integer('otp_id')
      .notNull()
      .references(() => otps.id, { onDelete: 'cascade' }),
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id),
    action: text('action').notNull(),
    timestamp: text('timestamp').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (table) => {
    return {
      otpIdIdx: index('idx_usage_logs_otp_id').on(table.otp_id),
      userIdIdx: index('idx_usage_logs_user_id').on(table.user_id),
    };
  },
);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type OTP = typeof otps.$inferSelect;
export type NewOTP = typeof otps.$inferInsert;
export type UsageLog = typeof usage_logs.$inferSelect;
export type NewUsageLog = typeof usage_logs.$inferInsert;

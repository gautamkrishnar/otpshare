import type { OTP, OTPWithUser } from '@otpshare/shared';
import { and, asc, desc, eq, gte, inArray, like, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import db from '../config/database';
import { otps, usage_logs, users } from '../db/schema';

const createdByUser = alias(users, 'createdByUser');
const usedByUser = alias(users, 'usedByUser');

export class OTPModel {
  static async createBulk(codes: string[], createdBy: number): Promise<number> {
    const values = codes.map((code) => ({ code, created_by: createdBy }));
    await db.insert(otps).values(values);
    return codes.length;
  }

  static async findById(id: number): Promise<OTP | undefined> {
    const result = await db.select().from(otps).where(eq(otps.id, id));
    return result[0] as OTP | undefined;
  }

  static async findAvailable(limit = 3): Promise<OTPWithUser[]> {
    const result = await db
      .select({
        id: otps.id,
        code: otps.code,
        status: otps.status,
        created_at: otps.created_at,
        created_by: otps.created_by,
        createdByUsername: createdByUser.username,
        used_at: otps.used_at,
        used_by: otps.used_by,
        usedByUsername: usedByUser.username,
      })
      .from(otps)
      .leftJoin(createdByUser, eq(otps.created_by, createdByUser.id))
      .leftJoin(usedByUser, eq(otps.used_by, usedByUser.id))
      .where(eq(otps.status, 'unused'))
      .orderBy(asc(otps.created_at), asc(otps.id))
      .limit(limit);

    return result as OTPWithUser[];
  }

  static async findRecentlyUsed(days = 7): Promise<OTPWithUser[]> {
    const daysAgo = sql`datetime('now', '-' || ${days} || ' days')`;

    const result = await db
      .select({
        id: otps.id,
        code: otps.code,
        status: otps.status,
        created_at: otps.created_at,
        created_by: otps.created_by,
        createdByUsername: createdByUser.username,
        used_at: otps.used_at,
        used_by: otps.used_by,
        usedByUsername: usedByUser.username,
      })
      .from(otps)
      .leftJoin(createdByUser, eq(otps.created_by, createdByUser.id))
      .leftJoin(usedByUser, eq(otps.used_by, usedByUser.id))
      .where(and(eq(otps.status, 'used'), gte(otps.used_at, daysAgo)))
      .orderBy(desc(otps.used_at));

    return result as OTPWithUser[];
  }

  static async findAll(filters?: {
    status?: 'used' | 'unused';
    search?: string;
  }): Promise<OTPWithUser[]> {
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(otps.status, filters.status));
    }

    if (filters?.search) {
      conditions.push(like(otps.code, `%${filters.search}%`));
    }

    const result = await db
      .select({
        id: otps.id,
        code: otps.code,
        status: otps.status,
        created_at: otps.created_at,
        created_by: otps.created_by,
        createdByUsername: createdByUser.username,
        used_at: otps.used_at,
        used_by: otps.used_by,
        usedByUsername: usedByUser.username,
      })
      .from(otps)
      .leftJoin(createdByUser, eq(otps.created_by, createdByUser.id))
      .leftJoin(usedByUser, eq(otps.used_by, usedByUser.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(otps.created_at), desc(otps.id));

    return result as OTPWithUser[];
  }

  static async markAsUsed(id: number, userId: number): Promise<OTP | undefined> {
    const otp = await OTPModel.findById(id);
    if (!otp || otp.status === 'used') {
      return undefined;
    }

    const result = await db
      .update(otps)
      .set({
        status: 'used',
        used_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
        used_by: userId,
      })
      .where(and(eq(otps.id, id), eq(otps.status, 'unused')))
      .returning();

    if (result.length > 0) {
      await OTPModel.createUsageLog(id, userId, 'marked_as_used');
      return result[0] as OTP;
    }

    return undefined;
  }

  static async createUsageLog(otpId: number, userId: number, action: string): Promise<void> {
    await db.insert(usage_logs).values({
      otp_id: otpId,
      user_id: userId,
      action,
    });
  }

  static async getStats(): Promise<{ total: number; used: number; unused: number }> {
    const result = await db
      .select({
        total: sql<number>`COUNT(*)`,
        used: sql<number>`SUM(CASE WHEN ${otps.status} = 'used' THEN 1 ELSE 0 END)`,
        unused: sql<number>`SUM(CASE WHEN ${otps.status} = 'unused' THEN 1 ELSE 0 END)`,
      })
      .from(otps);

    return result[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(otps).where(eq(otps.id, id));
    return result.rowsAffected > 0;
  }

  static async deleteBulk(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await db.delete(otps).where(inArray(otps.id, ids));
    return result.rowsAffected;
  }

  static async markBulkAsUsed(ids: number[], userId: number): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await db
      .update(otps)
      .set({
        status: 'used',
        used_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
        used_by: userId,
      })
      .where(and(inArray(otps.id, ids), eq(otps.status, 'unused')))
      .returning({ id: otps.id });

    if (result.length > 0) {
      for (const otp of result) {
        await OTPModel.createUsageLog(otp.id, userId, 'marked_as_used');
      }
    }

    return result.length;
  }

  static async markAsUnused(id: number): Promise<OTP | undefined> {
    const otp = await OTPModel.findById(id);
    if (!otp || otp.status === 'unused') {
      return undefined;
    }

    const result = await db
      .update(otps)
      .set({
        status: 'unused',
        used_at: null,
        used_by: null,
      })
      .where(and(eq(otps.id, id), eq(otps.status, 'used')))
      .returning();

    if (result.length > 0) {
      return result[0] as OTP;
    }

    return undefined;
  }

  static async markBulkAsUnused(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await db
      .update(otps)
      .set({
        status: 'unused',
        used_at: null,
        used_by: null,
      })
      .where(and(inArray(otps.id, ids), eq(otps.status, 'used')))
      .returning({ id: otps.id });

    return result.length;
  }
}

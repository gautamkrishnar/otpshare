import type { OTP, OTPWithUser } from '@otpshare/shared';
import db from '../config/database';

export class OTPModel {
  static createBulk(codes: string[]): number {
    const stmt = db.prepare('INSERT INTO otps (code) VALUES (?)');

    const insertMany = db.transaction((codes: string[]) => {
      for (const code of codes) {
        stmt.run(code);
      }
    });

    insertMany(codes);
    return codes.length;
  }

  static findById(id: number): OTP | undefined {
    const stmt = db.prepare('SELECT * FROM otps WHERE id = ?');
    return stmt.get(id) as OTP | undefined;
  }

  static findAvailable(limit = 3): OTPWithUser[] {
    const stmt = db.prepare(`
      SELECT o.*, u.username
      FROM otps o
      LEFT JOIN users u ON o.used_by = u.id
      WHERE o.status = 'unused'
      ORDER BY o.created_at ASC, o.id ASC
      LIMIT ?
    `);
    return stmt.all(limit) as OTPWithUser[];
  }

  static findRecentlyUsed(days = 7): OTPWithUser[] {
    const stmt = db.prepare(`
      SELECT o.*, u.username
      FROM otps o
      LEFT JOIN users u ON o.used_by = u.id
      WHERE o.status = 'used'
        AND o.used_at >= datetime('now', '-' || ? || ' days')
      ORDER BY o.used_at DESC
    `);
    return stmt.all(days) as OTPWithUser[];
  }

  static findAll(filters?: { status?: 'used' | 'unused'; search?: string }): OTPWithUser[] {
    let query = `
      SELECT o.*, u.username
      FROM otps o
      LEFT JOIN users u ON o.used_by = u.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (filters?.status) {
      query += ' AND o.status = ?';
      params.push(filters.status);
    }

    if (filters?.search) {
      query += ' AND o.code LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY o.created_at DESC, o.id DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params) as OTPWithUser[];
  }

  static markAsUsed(id: number, userId: number): OTP | undefined {
    const otp = OTPModel.findById(id);
    if (!otp || otp.status === 'used') {
      return undefined;
    }

    const stmt = db.prepare(`
      UPDATE otps
      SET status = 'used',
          used_at = CURRENT_TIMESTAMP,
          used_by = ?
      WHERE id = ? AND status = 'unused'
    `);

    const result = stmt.run(userId, id);

    if (result.changes > 0) {
      OTPModel.createUsageLog(id, userId, 'marked_as_used');
      return OTPModel.findById(id);
    }

    return undefined;
  }

  static createUsageLog(otpId: number, userId: number, action: string): void {
    const stmt = db.prepare(`
      INSERT INTO usage_logs (otp_id, user_id, action)
      VALUES (?, ?, ?)
    `);
    stmt.run(otpId, userId, action);
  }

  static getStats(): { total: number; used: number; unused: number } {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used,
        SUM(CASE WHEN status = 'unused' THEN 1 ELSE 0 END) as unused
      FROM otps
    `);
    return stmt.get() as { total: number; used: number; unused: number };
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM otps WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static deleteBulk(ids: number[]): number {
    if (ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`DELETE FROM otps WHERE id IN (${placeholders})`);
    const result = stmt.run(...ids);
    return result.changes;
  }

  static markBulkAsUsed(ids: number[], userId: number): number {
    if (ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`
      UPDATE otps
      SET status = 'used',
          used_at = CURRENT_TIMESTAMP,
          used_by = ?
      WHERE id IN (${placeholders}) AND status = 'unused'
    `);

    const result = stmt.run(userId, ...ids);

    if (result.changes > 0) {
      const affectedOTPs = db
        .prepare(`SELECT id FROM otps WHERE id IN (${placeholders})`)
        .all(...ids) as { id: number }[];

      for (const otp of affectedOTPs) {
        OTPModel.createUsageLog(otp.id, userId, 'marked_as_used');
      }
    }

    return result.changes;
  }
}

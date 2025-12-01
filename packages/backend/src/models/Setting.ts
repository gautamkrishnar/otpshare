import { eq, sql } from 'drizzle-orm';
import db from '../config/database';
import { type Setting, settings } from '../db/schema';

export const SETTING_KEYS = {
  JWT_EXPIRATION_HOURS: 'jwt_expiration_hours',
} as const;

export const DEFAULT_SETTINGS = {
  [SETTING_KEYS.JWT_EXPIRATION_HOURS]: '24',
} as const;

export class SettingModel {
  static async get(key: string): Promise<Setting | undefined> {
    const result = await db.select().from(settings).where(eq(settings.key, key));
    return result[0];
  }

  static async getValue(key: string): Promise<string | undefined> {
    const setting = await SettingModel.get(key);
    return setting?.value;
  }

  static async set(key: string, value: string): Promise<Setting> {
    const existing = await SettingModel.get(key);

    if (existing) {
      const result = await db
        .update(settings)
        .set({
          value,
          updated_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
        })
        .where(eq(settings.key, key))
        .returning();
      return result[0] as Setting;
    }

    const result = await db
      .insert(settings)
      .values({
        key,
        value,
      })
      .returning();
    return result[0] as Setting;
  }

  static async getAll(): Promise<Setting[]> {
    const result = await db.select().from(settings);
    return result;
  }

  static async getJWTExpirationHours(): Promise<number> {
    const value = await SettingModel.getValue(SETTING_KEYS.JWT_EXPIRATION_HOURS);
    const hours = value ? Number.parseInt(value, 10) : Number.parseInt(DEFAULT_SETTINGS[SETTING_KEYS.JWT_EXPIRATION_HOURS], 10);

    // Validate that hours is a positive number
    if (Number.isNaN(hours) || hours <= 0) {
      return Number.parseInt(DEFAULT_SETTINGS[SETTING_KEYS.JWT_EXPIRATION_HOURS], 10);
    }

    return hours;
  }

  static async setJWTExpirationHours(hours: number): Promise<Setting> {
    if (hours <= 0 || !Number.isFinite(hours)) {
      throw new Error('JWT expiration hours must be a positive number');
    }

    return SettingModel.set(SETTING_KEYS.JWT_EXPIRATION_HOURS, hours.toString());
  }
}

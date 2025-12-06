import type { CreateUserInput, UpdateUserInput, UserWithDates } from '@otpshare/shared';
import bcrypt from 'bcrypt';
import { type SQL, eq, sql } from 'drizzle-orm';
import db from '../config/database';
import { users } from '../db/schema';

export interface UserDB extends UserWithDates {
  password_hash: string;
}

// For backward compatibility
export type User = UserDB;

export class UserModel {
  static async create(input: CreateUserInput): Promise<User> {
    const passwordHash = await bcrypt.hash(input.password, 10);

    const result = await db
      .insert(users)
      .values({
        username: input.username,
        password_hash: passwordHash,
        role: input.role,
      })
      .returning();

    return result[0] as User;
  }

  static async findById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] as User | undefined;
  }

  static async findByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] as User | undefined;
  }

  static async findAll(filters?: {
    page?: number;
    perPage?: number;
  }): Promise<{ data: User[]; total: number }> {
    // Get total count
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const total = countResult[0].count;

    // Get paginated data
    const page = filters?.page ?? 1;
    const perPage = filters?.perPage ?? 10;
    const offset = (page - 1) * perPage;

    const result = await db
      .select()
      .from(users)
      .orderBy(users.created_at)
      .limit(perPage)
      .offset(offset);

    return { data: result as User[], total };
  }

  static async update(id: number, input: UpdateUserInput): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    if (!user) return undefined;

    const updateData: Record<string, string | number | boolean | SQL> = {
      updated_at: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
    };

    if (input.username !== undefined) {
      updateData.username = input.username;
    }

    if (input.password !== undefined) {
      updateData.password_hash = await bcrypt.hash(input.password, 10);
    }

    if (input.role !== undefined) {
      updateData.role = input.role;
    }

    if (input.dark_mode !== undefined) {
      updateData.dark_mode = input.dark_mode;
    }

    const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning();

    return result[0] as User | undefined;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowsAffected > 0;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  static async hasAdminUser(): Promise<boolean> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'admin'));
    return result[0].count > 0;
  }
}

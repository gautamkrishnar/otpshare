import type { CreateUserInput, UpdateUserInput, UserWithDates } from '@otpshare/shared';
import bcrypt from 'bcrypt';
import db from '../config/database';

export interface UserDB extends UserWithDates {
  password_hash: string;
}

// For backward compatibility
export type User = UserDB;

export class UserModel {
  static async create(input: CreateUserInput): Promise<User> {
    const passwordHash = await bcrypt.hash(input.password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (username, password_hash, role)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(input.username, passwordHash, input.role);

    return UserModel.findById(result.lastInsertRowid as number)!;
  }

  static findById(id: number): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  static findByUsername(username: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) as User | undefined;
  }

  static findAll(): User[] {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all() as User[];
  }

  static async update(id: number, input: UpdateUserInput): Promise<User | undefined> {
    const user = UserModel.findById(id);
    if (!user) return undefined;

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (input.username !== undefined) {
      updates.push('username = ?');
      values.push(input.username);
    }

    if (input.password !== undefined) {
      const passwordHash = await bcrypt.hash(input.password, 10);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (input.role !== undefined) {
      updates.push('role = ?');
      values.push(input.role);
    }

    if (updates.length === 0) return user;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return UserModel.findById(id);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  static hasAdminUser(): boolean {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?');
    const result = stmt.get('admin') as { count: number };
    return result.count > 0;
  }
}

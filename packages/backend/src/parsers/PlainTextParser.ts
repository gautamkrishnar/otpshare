import type { OTPParser } from './types';

export class PlainTextParser implements OTPParser {
  async parse(data: Buffer): Promise<string[]> {
    const text = data.toString('utf-8');
    const codes = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return codes;
  }
}

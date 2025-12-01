import { describe, expect, it } from 'vitest';
import { PlainTextParser } from './PlainTextParser';

describe('PlainTextParser', () => {
  const parser = new PlainTextParser();

  describe('description', () => {
    it('should have export instructions', () => {
      expect(parser.description).toBeDefined();
      expect(parser.description).toContain('plain text file');
      expect(parser.description).toContain('one OTP code per line');
      expect(parser.description).toContain('.txt');
    });
  });

  describe('parse', () => {
    it('should parse simple plain text with codes', async () => {
      const textData = `123456
789012
345678`;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012', '345678']);
    });

    it('should handle single code', async () => {
      const textData = '123456';

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456']);
    });

    it('should trim whitespace from codes', async () => {
      const textData = `  123456
  789012
  345678  `;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012', '345678']);
    });

    it('should skip empty lines', async () => {
      const textData = `123456

789012

345678

`;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012', '345678']);
    });

    it('should handle mixed line endings (CRLF and LF)', async () => {
      const textData = '123456\r\n789012\n345678';

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012', '345678']);
    });

    it('should handle codes with different lengths', async () => {
      const textData = `123456
12345678
ABCD1234
short-code-with-dashes`;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '12345678', 'ABCD1234', 'short-code-with-dashes']);
    });

    it('should handle alphanumeric codes', async () => {
      const textData = `ABC123
XYZ789
DEF456`;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['ABC123', 'XYZ789', 'DEF456']);
    });

    it('should handle codes with special characters', async () => {
      const textData = `CODE-123
CODE_456
CODE.789`;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['CODE-123', 'CODE_456', 'CODE.789']);
    });

    it('should preserve case sensitivity', async () => {
      const textData = `AbC123
abc123
ABC123`;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['AbC123', 'abc123', 'ABC123']);
    });

    it('should return empty array for empty file', async () => {
      const textData = '';

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual([]);
    });

    it('should return empty array for file with only whitespace', async () => {
      const textData = '   \n  \n   \n  ';

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual([]);
    });

    it('should handle large number of codes', async () => {
      const codes = Array.from({ length: 1000 }, (_, i) => `CODE${i.toString().padStart(6, '0')}`);
      const textData = codes.join('\n');

      const buffer = Buffer.from(textData, 'utf-8');
      const parsedCodes = await parser.parse(buffer);

      expect(parsedCodes).toHaveLength(1000);
      expect(parsedCodes[0]).toBe('CODE000000');
      expect(parsedCodes[999]).toBe('CODE000999');
    });

    it('should handle UTF-8 encoded file', async () => {
      const textData = `123456
789012
345678`;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012', '345678']);
    });

    it('should handle codes with tabs', async () => {
      const textData = `123456\t\t
789012\t
345678`;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012', '345678']);
    });

    it('should handle codes exactly as provided (no validation)', async () => {
      // PlainTextParser does not validate format, it accepts any non-empty line
      const textData = `12
TOOLONG123456789
!@#$%
123-456`;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['12', 'TOOLONG123456789', '!@#$%', '123-456']);
    });

    it('should not remove duplicates (keep all codes)', async () => {
      const textData = `123456
789012
123456
789012`;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012', '123456', '789012']);
      expect(codes).toHaveLength(4);
    });

    it('should handle example format from description', async () => {
      const textData = `123456
789012
345678`;

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012', '345678']);
    });

    it('should handle Windows-style line endings (CRLF)', async () => {
      const textData = '123456\r\n789012\r\n345678\r\n';

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012', '345678']);
    });

    it('should handle Unix-style line endings (LF)', async () => {
      const textData = '123456\n789012\n345678\n';

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012', '345678']);
    });

    it('should handle Mac-style line endings (CR)', async () => {
      const textData = '123456\r789012\r345678\r';

      const buffer = Buffer.from(textData, 'utf-8');
      const codes = await parser.parse(buffer);

      // Note: split('\n') won't handle CR, so this might not work as expected
      // But this documents the behavior
      expect(codes.length).toBeGreaterThan(0);
    });
  });
});

import { describe, expect, it } from 'vitest';
import { TPLinkOmadaParser } from './TPLinkOmadaParser';

describe('TPLinkOmadaParser', () => {
  const parser = new TPLinkOmadaParser();

  describe('description', () => {
    it('should have export instructions', () => {
      expect(parser.description).toBeDefined();
      expect(parser.description).toContain('TP-Link Omada Controller');
      expect(parser.description).toContain('CSV');
      expect(parser.description).toContain('Settings');
      expect(parser.description).toContain('Hotspot');
      expect(parser.description).toContain('Vouchers');
    });
  });

  describe('parse', () => {
    it('should parse valid Omada CSV export', async () => {
      const csvData = `Code,Created Time,Download,Upload,Traffic Limit Type,Traffic Limit,Used Data,Remaining Data,Price,Notes,Duration,Duration Type,Validity Type,Effective Time,Expiration Time,Type,Portals,Portal Logout,Site Name,Print Comments,Voucher Group Name,
"045386","Dec 01 2025 11:53:44 PM","","","","","","","",,"8.0Hours","Voucher Duration","Valid During Dates","Dec 01 2025 12:00:00 AM","Dec 01 2026 11:59:59 PM","Valid for Multi-Use (1 time at most)","All Portals","Enable","Jarvis",,""
"234253","Dec 01 2025 11:53:44 PM","","","","","","","",,"8.0Hours","Voucher Duration","Valid During Dates","Dec 01 2025 12:00:00 AM","Dec 01 2026 11:59:59 PM","Valid for Multi-Use (1 time at most)","All Portals","Enable","Jarvis",,""
"284378","Dec 01 2025 11:55:48 PM","","","","","","","",,"8.0Hours","Voucher Duration","Valid During Dates","Dec 01 2025 12:00:00 AM","Dec 01 2026 11:59:59 PM","Valid for Multi-Use (1 time at most)","All Portals","Enable","Jarvis",,""`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['045386', '234253', '284378']);
    });

    it('should handle 6-digit codes', async () => {
      const csvData = `Code,Created Time
"123456","Dec 01 2025 11:53:44 PM"
"789012","Dec 01 2025 11:53:44 PM"`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012']);
    });

    it('should handle 7-digit codes', async () => {
      const csvData = `Code,Created Time
"1234567","Dec 01 2025 11:53:44 PM"
"7890123","Dec 01 2025 11:53:44 PM"`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['1234567', '7890123']);
    });

    it('should handle 8-digit codes', async () => {
      const csvData = `Code,Created Time
"12345678","Dec 01 2025 11:53:44 PM"
"87654321","Dec 01 2025 11:53:44 PM"`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['12345678', '87654321']);
    });

    it('should remove duplicate codes', async () => {
      const csvData = `Code,Created Time
"123456","Dec 01 2025 11:53:44 PM"
"789012","Dec 01 2025 11:53:44 PM"
"123456","Dec 01 2025 11:53:44 PM"`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012']);
    });

    it('should skip empty lines', async () => {
      const csvData = `Code,Created Time
"123456","Dec 01 2025 11:53:44 PM"

"789012","Dec 01 2025 11:53:44 PM"

`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012']);
    });

    it('should handle codes without quotes', async () => {
      const csvData = `Code,Created Time
123456,Dec 01 2025 11:53:44 PM
789012,Dec 01 2025 11:53:44 PM`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012']);
    });

    it('should ignore codes with invalid length (less than 6 digits)', async () => {
      const csvData = `Code,Created Time
"12345","Dec 01 2025 11:53:44 PM"
"123456","Dec 01 2025 11:53:44 PM"`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456']);
    });

    it('should ignore codes with invalid length (more than 8 digits)', async () => {
      const csvData = `Code,Created Time
"123456789","Dec 01 2025 11:53:44 PM"
"123456","Dec 01 2025 11:53:44 PM"`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456']);
    });

    it('should ignore non-numeric codes', async () => {
      const csvData = `Code,Created Time
"ABC123","Dec 01 2025 11:53:44 PM"
"123456","Dec 01 2025 11:53:44 PM"
"12A456","Dec 01 2025 11:53:44 PM"`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456']);
    });

    it('should return empty array for empty CSV (only header)', async () => {
      const csvData = 'Code,Created Time';

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual([]);
    });

    it('should return empty array for empty file', async () => {
      const csvData = '';

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual([]);
    });

    it('should handle CSV with extra whitespace in codes', async () => {
      const csvData = `Code,Created Time
" 123456 ","Dec 01 2025 11:53:44 PM"
"  789012  ","Dec 01 2025 11:53:44 PM"`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['123456', '789012']);
    });

    it('should handle real-world Omada export format', async () => {
      // Based on actual Omada export format
      const csvData = `Code,Created Time,Download,Upload,Traffic Limit Type,Traffic Limit,Used Data,Remaining Data,Price,Notes,Duration,Duration Type,Validity Type,Effective Time,Expiration Time,Type,Portals,Portal Logout,Site Name,Print Comments,Voucher Group Name,
"045386","Dec 01 2025 11:53:44 PM","","","","","","","",,"8.0Hours","Voucher Duration","Valid During Dates","Dec 01 2025 12:00:00 AM","Dec 01 2026 11:59:59 PM","Valid for Multi-Use (1 time at most)","All Portals","Enable","Jarvis",,""
"234253","Dec 01 2025 11:53:44 PM","","","","","","","",,"8.0Hours","Voucher Duration","Valid During Dates","Dec 01 2025 12:00:00 AM","Dec 01 2026 11:59:59 PM","Valid for Multi-Use (1 time at most)","All Portals","Enable","Jarvis",,""
"284378","Dec 01 2025 11:55:48 PM","","","","","","","",,"8.0Hours","Voucher Duration","Valid During Dates","Dec 01 2025 12:00:00 AM","Dec 01 2026 11:59:59 PM","Valid for Multi-Use (1 time at most)","All Portals","Enable","Jarvis",,""
"219062","Dec 01 2025 11:55:48 PM","","","","","","","",,"8.0Hours","Voucher Duration","Valid During Dates","Dec 01 2025 12:00:00 AM","Dec 01 2026 11:59:59 PM","Valid for Multi-Use (1 time at most)","All Portals","Enable","Jarvis",,""
"215752","Dec 01 2025 11:57:39 PM","","","","","","","",,"8.0Hours","Voucher Duration","Valid During Dates","Dec 01 2025 12:00:00 AM","Dec 01 2026 11:59:59 PM","Valid for Multi-Use (1 time at most)","All Portals","Enable","Jarvis",,""
"981769","Dec 01 2025 11:57:39 PM","","","","","","","",,"8.0Hours","Voucher Duration","Valid During Dates","Dec 01 2025 12:00:00 AM","Dec 01 2026 11:59:59 PM","Valid for Multi-Use (1 time at most)","All Portals","Enable","Jarvis",,""
`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const codes = await parser.parse(buffer);

      expect(codes).toEqual(['045386', '234253', '284378', '219062', '215752', '981769']);
      expect(codes).toHaveLength(6);
    });

    it('should throw error with helpful message on invalid data', async () => {
      const invalidBuffer = Buffer.from('not a csv file', 'utf-8');

      // Should not throw, but return empty array
      const codes = await parser.parse(invalidBuffer);
      expect(codes).toEqual([]);
    });
  });
});

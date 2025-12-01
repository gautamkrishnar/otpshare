import type { OTPParser } from './types';

export class TPLinkOmadaParser implements OTPParser {
  name = 'TP-Link Omada';

  description = `How to export vouchers from TP-Link Omada Controller:

1. Log in to your TP-Link Omada Controller
2. Navigate to: Settings > Hotspot > Vouchers
3. Select the vouchers you want to export (or select all)
4. Click the "Export" button
5. Choose "CSV" as the export format
6. Save the exported file (e.g., VoucherList_YYYY-MM-DD-HH-MM.csv)
7. Upload the CSV file using this import tool

Note: The parser will automatically extract the voucher codes from the first column of the CSV file.`;

  fileExtensions = ['.csv'];
  mimeTypes = ['text/csv', 'application/csv'];

  async parse(data: Buffer): Promise<string[]> {
    try {
      // Convert buffer to string
      const text = data.toString('utf-8');

      // Split into lines
      const lines = text.split('\n');

      // Skip the header line and process data lines
      const codes: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) continue;

        // Parse CSV line - the code is in the first column
        // Handle quoted values
        const match = line.match(/^"?([^",]+)"?/);

        if (match?.[1]) {
          const code = match[1].trim();

          // Validate that it's a valid code (6-8 digits based on typical Omada voucher format)
          if (/^\d{6,8}$/.test(code)) {
            codes.push(code);
          }
        }
      }

      // Remove duplicates
      const uniqueCodes = [...new Set(codes)];

      return uniqueCodes;
    } catch (error) {
      throw new Error(
        `Failed to parse TP-Link Omada CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

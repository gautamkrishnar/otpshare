import { Readable } from 'node:stream';
import csv from 'csv-parser';
import type { OTPParser } from './types';

interface OmadaVoucherRow {
  Code: string;
  Type: string;
  Duration: string;
  'Start Time': string;
  'Expire Time': string;
  'MAC Address': string;
  'Multi-Login': string;
  Note: string;
}

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
      return new Promise((resolve, reject) => {
        const stream = Readable.from(data);
        const rows: OmadaVoucherRow[] = [];

        stream
          .pipe(csv())
          .on('data', (row: OmadaVoucherRow) => {
            rows.push(row);
          })
          .on('end', () => {
            const codes: string[] = [];

            for (const row of rows) {
              // Get the Code and Type columns by header name
              const code = row.Code?.trim();
              const voucherType = row.Type?.trim().toLowerCase();

              if (code) {
                // Validate that it's a valid code (6-8 digits based on typical Omada voucher format)
                if (/^\d{6,8}$/.test(code)) {
                  // Skip if the voucher type is "Expired"
                  const isExpired = voucherType === 'expired';

                  if (!isExpired) {
                    codes.push(code);
                  }
                }
              }
            }

            // Remove duplicates
            const uniqueCodes = [...new Set(codes)];
            resolve(uniqueCodes);
          })
          .on('error', (error: Error) => {
            reject(new Error(`Failed to parse TP-Link Omada CSV: ${error.message}`));
          });
      });
    } catch (error) {
      throw new Error(
        `Failed to parse TP-Link Omada CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

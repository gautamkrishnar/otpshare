import type { OTPParser } from './types';
import PDFParser from 'pdf2json';

export class TPLinkOmadaParser implements OTPParser {
  async parse(data: Buffer): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (errData: Error | { parserError: Error }) => {
        const errorMsg = errData instanceof Error ? errData.message : errData.parserError.message;
        reject(new Error(errorMsg));
      });

      pdfParser.on(
        'pdfParser_dataReady',
        (pdfData: {
          Pages?: Array<{
            Texts?: Array<{
              R?: Array<{ T?: string }>;
            }>;
          }>;
        }) => {
          try {
            // Extract text from all components
            let text = '';
            if (pdfData.Pages) {
              for (const page of pdfData.Pages) {
                if (page.Texts) {
                  for (const textItem of page.Texts) {
                    if (textItem.R) {
                      for (const run of textItem.R) {
                        if (run.T) {
                          text += `${decodeURIComponent(run.T)} `;
                        }
                      }
                    }
                  }
                }
              }
            }

            // Extract 8-digit OTP codes
            const otpRegex = /\b\d{8}\b/g;
            const matches = text.match(otpRegex);

            if (!matches) {
              resolve([]);
              return;
            }

            const uniqueOTPs = [...new Set(matches)] as string[];
            resolve(uniqueOTPs);
          } catch (error) {
            reject(error);
          }
        },
      );

      pdfParser.parseBuffer(data);
    });
  }
}

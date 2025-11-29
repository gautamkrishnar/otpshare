import type { OTPParser } from './types';

export class TPLinkOmadaParser implements OTPParser {
  async parse(data: Buffer): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PDFParser = require('pdf2json');

    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (errData: { parserError: string }) => {
        reject(new Error(errData.parserError));
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

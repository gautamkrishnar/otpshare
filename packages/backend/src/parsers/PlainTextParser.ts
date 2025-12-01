import type { OTPParser } from './types';

export class PlainTextParser implements OTPParser {
  name = 'Plain Text';

  description = `How to prepare a plain text file with OTP codes:

1. Create a new text file (.txt)
2. Add one OTP code per line
3. Remove any empty lines or extra whitespace
4. Save the file
5. Upload the text file using this import tool

Example format:
123456
789012
345678

Note: Each line should contain only one OTP code.`;

  fileExtensions = ['.txt'];
  mimeTypes = ['text/plain'];

  async parse(data: Buffer): Promise<string[]> {
    const text = data.toString('utf-8');
    const codes = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return codes;
  }
}

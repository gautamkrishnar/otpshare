import type { OTPParser } from './types';
import { VendorType } from './types';
import { PlainTextParser } from './PlainTextParser';
import { TPLinkOmadaParser } from './TPLinkOmadaParser';

export class ParserFactory {
  static getParser(vendorType: VendorType): OTPParser {
    switch (vendorType) {
      case VendorType.PLAIN_TEXT:
        return new PlainTextParser();
      case VendorType.TPLINK_OMADA:
        return new TPLinkOmadaParser();
      default:
        throw new Error(`Unsupported vendor type: ${vendorType}`);
    }
  }
}

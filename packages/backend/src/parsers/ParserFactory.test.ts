import { describe, expect, it } from 'vitest';
import { ParserFactory } from './ParserFactory';
import { PlainTextParser } from './PlainTextParser';
import { TPLinkOmadaParser } from './TPLinkOmadaParser';
import { VendorType } from './types';

describe('ParserFactory', () => {
  describe('getParser', () => {
    it('should return PlainTextParser for PLAIN_TEXT vendor type', () => {
      const parser = ParserFactory.getParser(VendorType.PLAIN_TEXT);

      expect(parser).toBeInstanceOf(PlainTextParser);
      expect(parser.description).toBeDefined();
    });

    it('should return TPLinkOmadaParser for TPLINK_OMADA vendor type', () => {
      const parser = ParserFactory.getParser(VendorType.TPLINK_OMADA);

      expect(parser).toBeInstanceOf(TPLinkOmadaParser);
      expect(parser.description).toBeDefined();
    });

    it('should throw error for unsupported vendor type', () => {
      const invalidVendorType = 'invalid_vendor' as VendorType;

      expect(() => ParserFactory.getParser(invalidVendorType)).toThrow(
        'Unsupported vendor type: invalid_vendor',
      );
    });

    it('should return parsers with parse method', () => {
      const plainTextParser = ParserFactory.getParser(VendorType.PLAIN_TEXT);
      const omadaParser = ParserFactory.getParser(VendorType.TPLINK_OMADA);

      expect(plainTextParser.parse).toBeDefined();
      expect(typeof plainTextParser.parse).toBe('function');

      expect(omadaParser.parse).toBeDefined();
      expect(typeof omadaParser.parse).toBe('function');
    });

    it('should return parsers with description field', () => {
      const plainTextParser = ParserFactory.getParser(VendorType.PLAIN_TEXT);
      const omadaParser = ParserFactory.getParser(VendorType.TPLINK_OMADA);

      expect(plainTextParser.description).toBeDefined();
      expect(typeof plainTextParser.description).toBe('string');
      expect(plainTextParser.description.length).toBeGreaterThan(0);

      expect(omadaParser.description).toBeDefined();
      expect(typeof omadaParser.description).toBe('string');
      expect(omadaParser.description.length).toBeGreaterThan(0);
    });

    it('should return new instance each time', () => {
      const parser1 = ParserFactory.getParser(VendorType.PLAIN_TEXT);
      const parser2 = ParserFactory.getParser(VendorType.PLAIN_TEXT);

      // Should be different instances
      expect(parser1).not.toBe(parser2);
      // But same class
      expect(parser1.constructor).toBe(parser2.constructor);
    });
  });
});

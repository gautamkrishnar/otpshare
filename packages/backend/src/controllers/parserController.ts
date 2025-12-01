import { type ParserMetadata, VendorType } from '@otpshare/shared';
import type { Request, Response } from 'express';
import { ParserFactory } from '../parsers/ParserFactory';

export const getParserMetadata = async (_req: Request, res: Response) => {
  try {
    const vendors = Object.values(VendorType);
    const metadata: ParserMetadata[] = vendors.map((vendorType) => {
      const parser = ParserFactory.getParser(vendorType);
      return {
        vendorType,
        name: parser.name,
        description: parser.description,
        fileExtensions: parser.fileExtensions,
        mimeTypes: parser.mimeTypes,
      };
    });

    res.json(metadata);
  } catch (_error) {
    res.status(500).json({ message: 'Failed to fetch parser metadata' });
  }
};

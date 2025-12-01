import { Router } from 'express';
import { getParserMetadata } from '../controllers/parserController';

const router = Router();

router.get('/metadata', getParserMetadata);

export default router;

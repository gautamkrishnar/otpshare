import { Router } from 'express';
import { getOTPs, markOTPAsUsed } from '../controllers/otpController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getOTPs);
router.put('/:id/use', authenticate, markOTPAsUsed);

export default router;

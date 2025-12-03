import { Router } from 'express';
import {
  changePassword,
  checkAdminExists,
  createInitialAdmin,
  login,
  updatePreferences,
  verifyToken,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/check-admin', checkAdminExists);
router.post('/initial-admin', createInitialAdmin);
router.post('/verify', authenticate, verifyToken);
router.put('/preferences', authenticate, updatePreferences);
router.put('/change-password', authenticate, changePassword);

export default router;

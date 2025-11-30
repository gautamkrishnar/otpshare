import { Router } from 'express';
import {
  login,
  checkAdminExists,
  createInitialAdmin,
  updatePreferences,
  changePassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/check-admin', checkAdminExists);
router.post('/initial-admin', createInitialAdmin);
router.put('/preferences', authenticate, updatePreferences);
router.put('/change-password', authenticate, changePassword);

export default router;

import { Router } from 'express';
import { login, checkAdminExists, createInitialAdmin } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.get('/check-admin', checkAdminExists);
router.post('/initial-admin', createInitialAdmin);

export default router;

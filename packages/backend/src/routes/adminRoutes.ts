import { Router } from 'express';
import multer from 'multer';
import {
  createUser,
  deleteBulkOTPs,
  deleteOTP,
  deleteUser,
  downloadBackup,
  getAllOTPs,
  getUsers,
  importOTPs,
  importOTPsFromFile,
  markBulkOTPsAsUnused,
  markBulkOTPsAsUsed,
  updateUser,
} from '../controllers/adminController';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate, requireAdmin);

router.post('/otp', importOTPs);
// biome-ignore lint/suspicious/noExplicitAny: Multer middleware has type conflicts with Express
router.post('/otp/file', upload.single('file') as any, importOTPsFromFile);
router.get('/otp', getAllOTPs);
router.delete('/otp/:id', deleteOTP);
router.post('/otp/bulk/delete', deleteBulkOTPs);
router.post('/otp/bulk/mark-used', markBulkOTPsAsUsed);
router.post('/otp/bulk/mark-unused', markBulkOTPsAsUnused);

router.post('/users', createUser);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.get('/backup', downloadBackup);

export default router;

import express from 'express';
import multer from 'multer';
import { submitWork, getSubmissions } from '../controllers/submissionController.js';

const router = express.Router();
const upload = multer({ dest: 'backend/uploads/' });

router.post('/', upload.single('file'), submitWork);
router.get('/', getSubmissions);

export default router;

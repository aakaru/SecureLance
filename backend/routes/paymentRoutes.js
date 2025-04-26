import express from 'express';
import { createStripePaymentIntent } from '../controllers/paymentController.js';

const router = express.Router();
router.post('/intent', createStripePaymentIntent);

export default router;
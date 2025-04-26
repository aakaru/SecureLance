import express from 'express';
const router = express.Router();
import {
    createGig,
    getGigs,
    selectFreelancer,
    completeGig,
} from '../controllers/gigController.js';

router.get('/', getGigs);
router.post('/', createGig);
router.put('/:contractGigId/select', selectFreelancer);
router.put('/:contractGigId/complete', completeGig);

export default router;

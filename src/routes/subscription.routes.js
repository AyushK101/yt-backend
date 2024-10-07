import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { userSubscribed, userUnsubscribed } from '../controllers/subscription.controller.js';

const router = Router()

router.route('/:username/subscribe').post(verifyJwt,userSubscribed)
router.route('/:username/unsubscribe').delete(verifyJwt,userUnsubscribed)

export default router;
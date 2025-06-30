import { Router } from 'express';
import authRouter from './auth.route.js';
import taskRouter from './task.route.js';

const router = Router();

// Example route
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

router.use('/auth', authRouter);
router.use('/tasks', taskRouter);

// Export the main router
export default router; 
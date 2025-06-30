import { Router } from 'express';
import { addTask, getAllTasks, getTasksList, updateTask, deleteTask } from '../controller/task.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, addTask);
router.get('/', authenticate, getAllTasks);
router.get('/list', authenticate, getTasksList);
router.patch('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

export default router; 
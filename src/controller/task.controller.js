import Joi from 'joi';
import { createTask, categoryExists, getTaskSegmentsByUser, getAllTasksByUser, updateTaskById, deleteTaskById } from '../db/tasks.js';

const taskSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('').max(1000),
  priority: Joi.string().valid('low', 'medium', 'high').required(),
  due_date: Joi.date().iso().required(),
  category_id: Joi.number().integer().required(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(255),
  description: Joi.string().allow('').max(1000),
  priority: Joi.string().valid('low', 'medium', 'high'),
  due_date: Joi.date().iso(),
  category_id: Joi.number().integer(),
  completed: Joi.boolean(),
});

export async function addTask(req, res) {
  const { error } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { title, description, priority, due_date, category_id } = req.body;
  const user_id = req.user?.id;
  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const exists = await categoryExists(category_id);
  if (!exists) {
    return res.status(400).json({ error: 'Category does not exist.' });
  }
  try {
    const task = await createTask({ title, description, priority, due_date, category_id, user_id });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add task.' });
  }
}

export async function getAllTasks(req, res) {
  const user_id = req.user?.id;
  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const segments = await getTaskSegmentsByUser(user_id);
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
}

export async function getTasksList(req, res) {
  const user_id = req.user?.id;
  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { page = 1, limit = 10, completed, priority, category_id, created_date } = req.query;
  try {
    const tasks = await getAllTasksByUser(user_id, {
      page: Number(page),
      limit: Number(limit),
      completed: completed !== undefined ? completed === 'true' : undefined,
      priority,
      category_id: category_id ? Number(category_id) : undefined,
      created_date,
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
}

export async function updateTask(req, res) {
  const user_id = req.user?.id;
  const { id } = req.params;
  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { error } = updateTaskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const task = await updateTaskById(user_id, id, req.body);
    if (!task) {
      return res.status(404).json({ error: 'Task not found or nothing to update.' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
}

export async function deleteTask(req, res) {
  const user_id = req.user?.id;
  const { id } = req.params;
  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const deleted = await deleteTaskById(user_id, id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
} 
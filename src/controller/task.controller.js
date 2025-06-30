import Joi from 'joi';
import { createTask, categoryExists, getTaskSegmentsByUser, getAllTasksByUser, updateTaskById, deleteTaskById } from '../db/tasks.js';

// Joi validation schema for creating a new task
const taskSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('').max(1000),
  priority: Joi.string().valid('low', 'medium', 'high').required(),
  due_date: Joi.date().iso().required(),
  category_id: Joi.number().integer().required(),
});

// Joi validation schema for updating a task (all fields optional)
const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(255),
  description: Joi.string().allow('').max(1000),
  priority: Joi.string().valid('low', 'medium', 'high'),
  due_date: Joi.date().iso(),
  category_id: Joi.number().integer(),
  completed: Joi.boolean(),
});

/**
 * Create a new task for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing task data
 * @param {Object} req.user - Authenticated user object (set by auth middleware)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created task or error
 */
export async function addTask(req, res) {
  // Validate request body against schema
  const { error } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const { title, description, priority, due_date, category_id } = req.body;
  const user_id = req.user?.id;
  
  // Check if user is authenticated
  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Verify that the category exists before creating the task
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

/**
 * Get task statistics and all tasks for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (set by auth middleware)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with task segments or error
 */
export async function getAllTasks(req, res) {
  const user_id = req.user?.id;
  
  // Check if user is authenticated
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

/**
 * Get paginated and filtered tasks for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters for filtering and pagination
 * @param {Object} req.user - Authenticated user object (set by auth middleware)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with filtered tasks or error
 */
export async function getTasksList(req, res) {
  const user_id = req.user?.id;
  
  // Check if user is authenticated
  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Extract query parameters with defaults
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

/**
 * Update a task for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters containing task ID
 * @param {Object} req.body - Request body containing fields to update
 * @param {Object} req.user - Authenticated user object (set by auth middleware)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated task or error
 */
export async function updateTask(req, res) {
  const user_id = req.user?.id;
  const { id } = req.params;
  
  // Check if user is authenticated
  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Validate request body against update schema
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

/**
 * Delete a task for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters containing task ID
 * @param {Object} req.user - Authenticated user object (set by auth middleware)
 * @param {Object} res - Express response object
 * @returns {Object} Response with success status or error
 */
export async function deleteTask(req, res) {
  const user_id = req.user?.id;
  const { id } = req.params;
  
  // Check if user is authenticated
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
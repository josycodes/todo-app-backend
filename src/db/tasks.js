import db from './knex.js';

/**
 * Check if a category exists in the database
 * @param {number} category_id - The ID of the category to check
 * @returns {Promise<boolean>} - True if category exists, false otherwise
 */
export async function categoryExists(category_id) {
  const category = await db('categories').where({ id: category_id }).first();
  return !!category;
}

/**
 * Create a new task in the database
 * @param {Object} taskData - Task data object
 * @param {string} taskData.title - Task title
 * @param {string} taskData.description - Task description
 * @param {string} taskData.priority - Task priority (low, medium, high)
 * @param {string} taskData.due_date - Task due date (ISO format)
 * @param {number} taskData.category_id - Category ID (must exist in categories table)
 * @param {number} taskData.user_id - User ID who owns the task
 * @returns {Promise<Object>} - Created task object
 */
export async function createTask({ title, description, priority, due_date, category_id, user_id }) {
  const [task] = await db('tasks')
    .insert({ title, description, priority, due_date, category_id, user_id })
    .returning(['id', 'title', 'description', 'priority', 'due_date', 'category_id', 'user_id']);
  return task;
}

/**
 * Get all tasks for a user with optional filtering and pagination
 * @param {number} user_id - User ID to get tasks for
 * @param {Object} options - Filter and pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Number of tasks per page (default: 10)
 * @param {boolean} options.completed - Filter by completion status
 * @param {string} options.priority - Filter by priority (low, medium, high)
 * @param {number} options.category_id - Filter by category ID
 * @param {string} options.created_date - Filter by creation date (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of tasks matching criteria
 */
export async function getAllTasksByUser(user_id, { page = 1, limit = 10, completed, priority, category_id, created_date } = {}) {
  let query = db('tasks').where({ user_id });
  
  // Apply filters if provided
  if (completed !== undefined) {
    query = query.andWhere('completed', completed);
  }
  if (priority) {
    query = query.andWhere('priority', priority);
  }
  if (category_id) {
    query = query.andWhere('category_id', category_id);
  }
  if (created_date) {
    query = query.andWhereRaw('DATE(created_at) = ?', [created_date]);
  }
  
  // Apply pagination and ordering
  query = query.orderBy('created_at', 'desc').limit(limit).offset((page - 1) * limit);
  return query;
}

/**
 * Get task statistics and all tasks for a user
 * @param {number} user_id - User ID to get task segments for
 * @returns {Promise<Object>} - Object containing task counts and all tasks
 */
export async function getTaskSegmentsByUser(user_id) {
  const allTasks = await db('tasks').where({ user_id });
  const total = allTasks.length;
  const completed = allTasks.filter(task => task.completed).length;
  const pending = allTasks.filter(task => !task.completed).length;
  const high_priority = allTasks.filter(task => task.priority === 'high').length;
  return { total, completed, pending, high_priority, tasks: allTasks };
}

/**
 * Update a task by ID for a specific user
 * @param {number} user_id - User ID who owns the task
 * @param {number} task_id - Task ID to update
 * @param {Object} updates - Fields to update
 * @param {string} updates.title - New task title
 * @param {string} updates.description - New task description
 * @param {string} updates.priority - New priority (low, medium, high)
 * @param {string} updates.due_date - New due date (ISO format)
 * @param {number} updates.category_id - New category ID
 * @param {boolean} updates.completed - New completion status
 * @returns {Promise<Object|null>} - Updated task object or null if no updates
 */
export async function updateTaskById(user_id, task_id, updates) {
  // Define allowed fields that can be updated
  const allowedFields = ['title', 'description', 'priority', 'due_date', 'category_id', 'completed'];
  const updateData = {};
  
  // Only include fields that are provided in the updates
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      updateData[key] = updates[key];
    }
  }
  
  // Return null if no valid fields to update
  if (Object.keys(updateData).length === 0) return null;
  
  const [task] = await db('tasks')
    .where({ id: task_id, user_id })
    .update(updateData)
    .returning(['id', 'title', 'description', 'priority', 'due_date', 'category_id', 'completed', 'user_id']);
  return task;
}

/**
 * Delete a task by ID for a specific user
 * @param {number} user_id - User ID who owns the task
 * @param {number} task_id - Task ID to delete
 * @returns {Promise<boolean>} - True if task was deleted, false if not found
 */
export async function deleteTaskById(user_id, task_id) {
  const deleted = await db('tasks')
    .where({ id: task_id, user_id })
    .del();
  return deleted > 0;
} 
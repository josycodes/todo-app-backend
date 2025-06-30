import db from './knex.js';

export async function categoryExists(category_id) {
  const category = await db('categories').where({ id: category_id }).first();
  return !!category;
}

export async function createTask({ title, description, priority, due_date, category_id, user_id }) {
  const [task] = await db('tasks')
    .insert({ title, description, priority, due_date, category_id, user_id })
    .returning(['id', 'title', 'description', 'priority', 'due_date', 'category_id', 'user_id']);
  return task;
}

export async function getAllTasksByUser(user_id, { page = 1, limit = 10, completed, priority, category_id, created_date } = {}) {
  let query = db('tasks').where({ user_id });
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
  query = query.orderBy('created_at', 'desc').limit(limit).offset((page - 1) * limit);
  return query;
}

export async function getTaskSegmentsByUser(user_id) {
  const allTasks = await db('tasks').where({ user_id });
  const total = allTasks.length;
  const completed = allTasks.filter(task => task.completed).length;
  const pending = allTasks.filter(task => !task.completed).length;
  const high_priority = allTasks.filter(task => task.priority === 'high').length;
  return { total, completed, pending, high_priority, tasks: allTasks };
}

export async function updateTaskById(user_id, task_id, updates) {
  const allowedFields = ['title', 'description', 'priority', 'due_date', 'category_id', 'completed'];
  const updateData = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      updateData[key] = updates[key];
    }
  }
  if (Object.keys(updateData).length === 0) return null;
  const [task] = await db('tasks')
    .where({ id: task_id, user_id })
    .update(updateData)
    .returning(['id', 'title', 'description', 'priority', 'due_date', 'category_id', 'completed', 'user_id']);
  return task;
}

export async function deleteTaskById(user_id, task_id) {
  const deleted = await db('tasks')
    .where({ id: task_id, user_id })
    .del();
  return deleted > 0;
} 
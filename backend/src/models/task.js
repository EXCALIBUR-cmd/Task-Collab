import pool from '../config/database.js';

export const createTask = async (listId, title, description, position) => {
  const result = await pool.query(
    'INSERT INTO tasks (list_id, title, description, position) VALUES ($1, $2, $3, $4) RETURNING *',
    [listId, title, description, position]
  );
  return result.rows[0];
};

export const getTaskById = async (taskId) => {
  const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
  return result.rows[0];
};

export const getTasksByListId = async (listId) => {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE list_id = $1 ORDER BY position',
    [listId]
  );
  return result.rows;
};

export const updateTask = async (taskId, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramCount}`);
    values.push(updates.title);
    paramCount++;
  }

  if (updates.description !== undefined) {
    fields.push(`description = $${paramCount}`);
    values.push(updates.description);
    paramCount++;
  }

  if (updates.position !== undefined) {
    fields.push(`position = $${paramCount}`);
    values.push(updates.position);
    paramCount++;
  }

  if (updates.listId !== undefined) {
    fields.push(`list_id = $${paramCount}`);
    values.push(updates.listId);
    paramCount++;
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(taskId);

  const result = await pool.query(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const deleteTask = async (taskId) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
};

export const assignUserToTask = async (taskId, userId) => {
  const result = await pool.query(
    'INSERT INTO task_assignments (task_id, user_id) VALUES ($1, $2) ON CONFLICT (task_id, user_id) DO NOTHING RETURNING *',
    [taskId, userId]
  );
  return result.rows[0];
};

export const unassignUserFromTask = async (taskId, userId) => {
  await pool.query('DELETE FROM task_assignments WHERE task_id = $1 AND user_id = $2', [taskId, userId]);
};

export const getTaskAssignments = async (taskId) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email 
     FROM task_assignments ta 
     JOIN users u ON ta.user_id = u.id 
     WHERE ta.task_id = $1`,
    [taskId]
  );
  return result.rows;
};

export const searchTasks = async (boardId, searchTerm, limit = 20, offset = 0) => {
  const result = await pool.query(
    `SELECT t.*, l.name as list_name, l.board_id 
     FROM tasks t 
     JOIN lists l ON t.list_id = l.id 
     WHERE l.board_id = $1 AND (t.title ILIKE $2 OR t.description ILIKE $2)
     ORDER BY t.updated_at DESC 
     LIMIT $3 OFFSET $4`,
    [boardId, `%${searchTerm}%`, limit, offset]
  );
  return result.rows;
};

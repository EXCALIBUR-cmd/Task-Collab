import pool from '../config/database.js';

export const createList = async (boardId, name, position) => {
  const result = await pool.query(
    'INSERT INTO lists (board_id, name, position) VALUES ($1, $2, $3) RETURNING *',
    [boardId, name, position]
  );
  return result.rows[0];
};

export const getListsByBoardId = async (boardId) => {
  const result = await pool.query(
    'SELECT * FROM lists WHERE board_id = $1 ORDER BY position',
    [boardId]
  );
  return result.rows;
};

export const getListById = async (listId) => {
  const result = await pool.query('SELECT * FROM lists WHERE id = $1', [listId]);
  return result.rows[0];
};

export const updateList = async (listId, name, position) => {
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }

  if (position !== undefined) {
    updates.push(`position = $${paramCount}`);
    values.push(position);
    paramCount++;
  }

  values.push(listId);

  const result = await pool.query(
    `UPDATE lists SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const deleteList = async (listId) => {
  await pool.query('DELETE FROM lists WHERE id = $1', [listId]);
};

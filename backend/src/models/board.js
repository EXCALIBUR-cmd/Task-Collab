import pool from '../config/database.js';

export const createBoard = async (name, ownerId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const boardResult = await client.query(
      'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING *',
      [name, ownerId]
    );
    const board = boardResult.rows[0];

    await client.query(
      'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3)',
      [board.id, ownerId, 'owner']
    );

    await client.query('COMMIT');
    return board;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getBoardsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await pool.query(
    `SELECT DISTINCT b.*, u.name as owner_name 
     FROM boards b 
     JOIN board_members bm ON b.id = bm.board_id 
     JOIN users u ON b.owner_id = u.id
     WHERE bm.user_id = $1 
     ORDER BY b.updated_at DESC 
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

export const getBoardById = async (boardId) => {
  const result = await pool.query(
    `SELECT b.*, u.name as owner_name 
     FROM boards b 
     JOIN users u ON b.owner_id = u.id 
     WHERE b.id = $1`,
    [boardId]
  );
  return result.rows[0];
};

export const updateBoard = async (boardId, name) => {
  const result = await pool.query(
    'UPDATE boards SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [name, boardId]
  );
  return result.rows[0];
};

export const deleteBoard = async (boardId) => {
  await pool.query('DELETE FROM boards WHERE id = $1', [boardId]);
};

export const checkBoardAccess = async (boardId, userId) => {
  const result = await pool.query(
    'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
    [boardId, userId]
  );
  return result.rows.length > 0;
};

export const addBoardMember = async (boardId, userId, role = 'member') => {
  const result = await pool.query(
    'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (board_id, user_id) DO NOTHING RETURNING *',
    [boardId, userId, role]
  );
  return result.rows[0];
};

export const removeBoardMember = async (boardId, userId) => {
  await pool.query('DELETE FROM board_members WHERE board_id = $1 AND user_id = $2', [boardId, userId]);
};

export const getBoardMembers = async (boardId) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, bm.role 
     FROM board_members bm 
     JOIN users u ON bm.user_id = u.id 
     WHERE bm.board_id = $1`,
    [boardId]
  );
  return result.rows;
};

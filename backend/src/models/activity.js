import pool from '../config/database.js';

export const createActivity = async (boardId, userId, action, entityType, entityId, details) => {
  const result = await pool.query(
    'INSERT INTO activity_logs (board_id, user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [boardId, userId, action, entityType, entityId, details]
  );
  return result.rows[0];
};

export const getActivitiesByBoardId = async (boardId, limit = 50, offset = 0) => {
  const result = await pool.query(
    `SELECT a.*, u.name as user_name 
     FROM activity_logs a 
     LEFT JOIN users u ON a.user_id = u.id 
     WHERE a.board_id = $1 
     ORDER BY a.created_at DESC 
     LIMIT $2 OFFSET $3`,
    [boardId, limit, offset]
  );
  return result.rows;
};

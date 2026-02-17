import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export const createUser = async (email, password, name) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
    [email, hashedPassword, name]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

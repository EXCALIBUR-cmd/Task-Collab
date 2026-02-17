import * as Board from '../models/board.js';
import * as Activity from '../models/activity.js';

export const createBoard = async (req, res, io) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    const board = await Board.createBoard(name, req.userId);
    await Activity.createActivity(board.id, req.userId, 'created', 'board', board.id, `Created board "${name}"`);

    res.status(201).json(board);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Error creating board' });
  }
};

export const getBoards = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const boards = await Board.getBoardsByUserId(req.userId, limit, offset);
    res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Error fetching boards' });
  }
};

export const getBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const hasAccess = await Board.checkBoardAccess(id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const board = await Board.getBoardById(id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const members = await Board.getBoardMembers(id);
    res.json({ ...board, members });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Error fetching board' });
  }
};

export const updateBoard = async (req, res, io) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const hasAccess = await Board.checkBoardAccess(id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const board = await Board.updateBoard(id, name);
    await Activity.createActivity(id, req.userId, 'updated', 'board', id, `Updated board name to "${name}"`);

    io.to(`board-${id}`).emit('board:updated', board);
    res.json(board);
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Error updating board' });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.getBoardById(id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.owner_id !== req.userId) {
      return res.status(403).json({ error: 'Only the owner can delete the board' });
    }

    await Board.deleteBoard(id);
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Error deleting board' });
  }
};

export const addMember = async (req, res, io) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    const hasAccess = await Board.checkBoardAccess(id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Board.addBoardMember(id, userId, role);
    const members = await Board.getBoardMembers(id);
    
    await Activity.createActivity(id, req.userId, 'added_member', 'board', id, `Added user to board`);
    
    io.to(`board-${id}`).emit('board:member_added', { boardId: id, members });
    res.json(members);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Error adding member' });
  }
};

export const removeMember = async (req, res, io) => {
  try {
    const { boardId, userId } = req.params;

    const hasAccess = await Board.checkBoardAccess(boardId, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Board.removeBoardMember(boardId, userId);
    await Activity.createActivity(boardId, req.userId, 'removed_member', 'board', boardId, `Removed user from board`);

    io.to(`board-${boardId}`).emit('board:member_removed', { boardId, userId });
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Error removing member' });
  }
};

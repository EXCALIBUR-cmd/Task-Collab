import * as List from '../models/list.js';
import * as Board from '../models/board.js';
import * as Activity from '../models/activity.js';

export const createList = async (req, res, io) => {
  try {
    const { boardId } = req.params;
    const { name, position } = req.body;

    const hasAccess = await Board.checkBoardAccess(boardId, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const list = await List.createList(boardId, name, position);
    await Activity.createActivity(boardId, req.userId, 'created', 'list', list.id, `Created list "${name}"`);

    io.to(`board-${boardId}`).emit('list:created', list);
    res.status(201).json(list);
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Error creating list' });
  }
};

export const getLists = async (req, res) => {
  try {
    const { boardId } = req.params;

    const hasAccess = await Board.checkBoardAccess(boardId, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const lists = await List.getListsByBoardId(boardId);
    res.json(lists);
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ error: 'Error fetching lists' });
  }
};

export const updateList = async (req, res, io) => {
  try {
    const { id } = req.params;
    const { name, position } = req.body;

    const list = await List.getListById(id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const hasAccess = await Board.checkBoardAccess(list.board_id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedList = await List.updateList(id, name, position);
    await Activity.createActivity(list.board_id, req.userId, 'updated', 'list', id, `Updated list`);

    io.to(`board-${list.board_id}`).emit('list:updated', updatedList);
    res.json(updatedList);
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Error updating list' });
  }
};

export const deleteList = async (req, res, io) => {
  try {
    const { id } = req.params;

    const list = await List.getListById(id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const hasAccess = await Board.checkBoardAccess(list.board_id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await List.deleteList(id);
    await Activity.createActivity(list.board_id, req.userId, 'deleted', 'list', id, `Deleted list`);

    io.to(`board-${list.board_id}`).emit('list:deleted', { listId: id });
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Error deleting list' });
  }
};

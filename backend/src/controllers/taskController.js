import * as Task from '../models/task.js';
import * as List from '../models/list.js';
import * as Board from '../models/board.js';
import * as Activity from '../models/activity.js';

export const createTask = async (req, res, io) => {
  try {
    const { listId } = req.params;
    const { title, description, position } = req.body;

    const list = await List.getListById(listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const hasAccess = await Board.checkBoardAccess(list.board_id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const task = await Task.createTask(listId, title, description, position);
    await Activity.createActivity(list.board_id, req.userId, 'created', 'task', task.id, `Created task "${title}"`);

    io.to(`board-${list.board_id}`).emit('task:created', task);
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Error creating task' });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const list = await List.getListById(task.list_id);
    const hasAccess = await Board.checkBoardAccess(list.board_id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const assignments = await Task.getTaskAssignments(id);
    res.json({ ...task, assignments });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Error fetching task' });
  }
};

export const getTasksByList = async (req, res) => {
  try {
    const { listId } = req.params;
    
    const list = await List.getListById(listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const hasAccess = await Board.checkBoardAccess(list.board_id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasks = await Task.getTasksByListId(listId);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks by list error:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

export const updateTask = async (req, res, io) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const list = await List.getListById(task.list_id);
    const hasAccess = await Board.checkBoardAccess(list.board_id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedTask = await Task.updateTask(id, updates);
    await Activity.createActivity(list.board_id, req.userId, 'updated', 'task', id, `Updated task`);

    io.to(`board-${list.board_id}`).emit('task:updated', updatedTask);
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Error updating task' });
  }
};

export const deleteTask = async (req, res, io) => {
  try {
    const { id } = req.params;

    const task = await Task.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const list = await List.getListById(task.list_id);
    const hasAccess = await Board.checkBoardAccess(list.board_id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Task.deleteTask(id);
    await Activity.createActivity(list.board_id, req.userId, 'deleted', 'task', id, `Deleted task`);

    io.to(`board-${list.board_id}`).emit('task:deleted', { taskId: id });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Error deleting task' });
  }
};

export const assignUser = async (req, res, io) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    const task = await Task.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const list = await List.getListById(task.list_id);
    const hasAccess = await Board.checkBoardAccess(list.board_id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Task.assignUserToTask(taskId, userId);
    const assignments = await Task.getTaskAssignments(taskId);
    await Activity.createActivity(list.board_id, req.userId, 'assigned', 'task', taskId, `Assigned user to task`);

    io.to(`board-${list.board_id}`).emit('task:assigned', { taskId, assignments });
    res.json(assignments);
  } catch (error) {
    console.error('Assign user error:', error);
    res.status(500).json({ error: 'Error assigning user' });
  }
};

export const unassignUser = async (req, res, io) => {
  try {
    const { taskId, userId } = req.params;

    const task = await Task.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const list = await List.getListById(task.list_id);
    const hasAccess = await Board.checkBoardAccess(list.board_id, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Task.unassignUserFromTask(taskId, userId);
    await Activity.createActivity(list.board_id, req.userId, 'unassigned', 'task', taskId, `Unassigned user from task`);

    io.to(`board-${list.board_id}`).emit('task:unassigned', { taskId, userId });
    res.json({ message: 'User unassigned successfully' });
  } catch (error) {
    console.error('Unassign user error:', error);
    res.status(500).json({ error: 'Error unassigning user' });
  }
};

export const searchTasks = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { q, limit = 20, offset = 0 } = req.query;

    const hasAccess = await Board.checkBoardAccess(boardId, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasks = await Task.searchTasks(boardId, q, parseInt(limit), parseInt(offset));
    res.json(tasks);
  } catch (error) {
    console.error('Search tasks error:', error);
    res.status(500).json({ error: 'Error searching tasks' });
  }
};

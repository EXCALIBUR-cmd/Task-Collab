import express from 'express';
import * as taskController from '../controllers/taskController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const createWithIO = (io) => {
  router.post('/:listId/tasks', auth, (req, res) => taskController.createTask(req, res, io));
  router.get('/list/:listId', auth, taskController.getTasksByList);
  router.get('/search/:boardId', auth, taskController.searchTasks);
  router.get('/:id', auth, taskController.getTask);
  router.put('/:id', auth, (req, res) => taskController.updateTask(req, res, io));
  router.delete('/:id', auth, (req, res) => taskController.deleteTask(req, res, io));
  router.post('/:taskId/assign', auth, (req, res) => taskController.assignUser(req, res, io));
  router.delete('/:taskId/assign/:userId', auth, (req, res) => taskController.unassignUser(req, res, io));

  return router;
};

export default createWithIO;

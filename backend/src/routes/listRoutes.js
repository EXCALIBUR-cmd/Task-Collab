import express from 'express';
import * as listController from '../controllers/listController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const createWithIO = (io) => {
  router.post('/:boardId/lists', auth, (req, res) => listController.createList(req, res, io));
  router.get('/:boardId/lists', auth, listController.getLists);
  router.put('/:id', auth, (req, res) => listController.updateList(req, res, io));
  router.delete('/:id', auth, (req, res) => listController.deleteList(req, res, io));

  return router;
};

export default createWithIO;

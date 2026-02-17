import express from 'express';
import * as boardController from '../controllers/boardController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const createWithIO = (io) => {
  router.post('/', auth, (req, res) => boardController.createBoard(req, res, io));
  router.get('/', auth, boardController.getBoards);
  router.get('/:id', auth, boardController.getBoard);
  router.put('/:id', auth, (req, res) => boardController.updateBoard(req, res, io));
  router.delete('/:id', auth, boardController.deleteBoard);
  router.post('/:id/members', auth, (req, res) => boardController.addMember(req, res, io));
  router.delete('/:boardId/members/:userId', auth, (req, res) => boardController.removeMember(req, res, io));

  return router;
};

export default createWithIO;

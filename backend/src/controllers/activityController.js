import * as Activity from '../models/activity.js';
import * as Board from '../models/board.js';

export const getActivities = async (req, res) => {
  try {
    const { boardId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const hasAccess = await Board.checkBoardAccess(boardId, req.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const activities = await Activity.getActivitiesByBoardId(boardId, limit, offset);
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Error fetching activities' });
  }
};

const Activity = require('../models/Activity');

const getWorkspaceActivity = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const skip = parseInt(req.query.skip) || 0;

    const activity = await Activity.find({ workspace: workspaceId })
      .populate('actor', 'name email avatar')
      .populate('taskRef', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments({ workspace: workspaceId });
    res.json({ activity, total, hasMore: skip + limit < total });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWorkspaceActivity };

const User = require('../models/User');
const Task = require('../models/Task');

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ users: [] });

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name email avatar')
      .limit(10);

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [total, completed, inProgress, overdue] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: 'completed' }),
      Task.countDocuments({ assignedTo: userId, status: 'in-progress' }),
      Task.countDocuments({
        assignedTo: userId,
        status: { $nin: ['completed'] },
        dueDate: { $lt: new Date() },
      }),
    ]);

    res.json({ stats: { total, completed, inProgress, overdue } });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchUsers, getUserStats };

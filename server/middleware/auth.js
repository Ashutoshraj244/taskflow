const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please log in again' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// checks user is a member (or owner) of the workspace param
const workspaceMember = async (req, res, next) => {
  try {
    const Workspace = require('../models/Workspace');
    const ws = await Workspace.findById(req.params.workspaceId || req.body.workspace);
    if (!ws) return res.status(404).json({ message: 'Workspace not found' });

    const isMember = ws.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    req.workspace = ws;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect, workspaceMember };

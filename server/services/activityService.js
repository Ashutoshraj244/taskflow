const Activity = require('../models/Activity');

const logActivity = async ({ actor, action, details, taskRef, workspace }) => {
  try {
    const entry = await Activity.create({ actor, action, details, taskRef, workspace });
    return entry;
  } catch (err) {
    // activity logging failures shouldn't crash the request
    console.error('Activity log error:', err.message);
    return null;
  }
};

module.exports = { logActivity };

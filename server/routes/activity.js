const router = require('express').Router({ mergeParams: true });
const { getWorkspaceActivity } = require('../controllers/activityController');
const { protect, workspaceMember } = require('../middleware/auth');

router.get('/:workspaceId', protect, workspaceMember, getWorkspaceActivity);

module.exports = router;

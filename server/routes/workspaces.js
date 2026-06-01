const router = require('express').Router();
const { body } = require('express-validator');
const {
  createWorkspace,
  getUserWorkspaces,
  getWorkspace,
  updateWorkspace,
  joinWorkspace,
  leaveWorkspace,
  regenerateInvite,
} = require('../controllers/workspaceController');
const { protect, workspaceMember } = require('../middleware/auth');

router.use(protect);

router.get('/', getUserWorkspaces);
router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Workspace name is required')],
  createWorkspace
);

router.post('/join', joinWorkspace);

router.get('/:workspaceId', workspaceMember, getWorkspace);
router.patch('/:workspaceId', workspaceMember, updateWorkspace);
router.post('/:workspaceId/leave', workspaceMember, leaveWorkspace);
router.post('/:workspaceId/invite/regenerate', workspaceMember, regenerateInvite);

module.exports = router;

const router = require('express').Router({ mergeParams: true });
const { body } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} = require('../controllers/taskController');
const { protect, workspaceMember } = require('../middleware/auth');

router.use(protect, workspaceMember);

router.get('/', getTasks);
router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Task title is required')],
  createTask
);
router.post('/reorder', reorderTasks);

router.get('/:taskId', getTask);
router.patch('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;

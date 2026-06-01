const router = require('express').Router();
const { searchUsers, getUserStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/search', searchUsers);
router.get('/stats', getUserStats);

module.exports = router;

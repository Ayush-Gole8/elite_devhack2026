const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getLeaderboard,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;

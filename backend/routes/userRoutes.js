const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getLeaderboard,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, admin, getUsers);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;

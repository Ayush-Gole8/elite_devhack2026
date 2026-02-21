const express = require('express');
const {
  getContests,
  getContest,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
} = require('../controllers/contestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getContests);
router.get('/:id', getContest);
router.post('/', protect, createContest);
router.put('/:id', protect, updateContest);
router.delete('/:id', protect, deleteContest);
router.post('/:id/register', protect, registerForContest);

module.exports = router;

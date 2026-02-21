const express = require('express');
const {
  getContests,
  getContest,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
} = require('../controllers/contestController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getContests);
router.get('/:id', getContest);
router.post('/', protect, admin, createContest);
router.put('/:id', protect, admin, updateContest);
router.delete('/:id', protect, admin, deleteContest);
router.post('/:id/register', protect, registerForContest);

module.exports = router;

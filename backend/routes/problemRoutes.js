const express = require('express');
const {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
} = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProblems);
router.get('/:id', getProblem);
router.post('/', protect, createProblem);
router.put('/:id', protect, updateProblem);
router.delete('/:id', protect, deleteProblem);

module.exports = router;

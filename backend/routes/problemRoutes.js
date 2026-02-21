const express = require('express');
const {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
} = require('../controllers/problemController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', optionalProtect, getProblems);
router.get('/:id', optionalProtect, getProblem);
router.post('/', protect, createProblem);
router.put('/:id', protect, updateProblem);
router.delete('/:id', protect, deleteProblem);

module.exports = router;

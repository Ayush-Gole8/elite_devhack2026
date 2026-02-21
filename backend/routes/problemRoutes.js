const express = require('express');
const {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
} = require('../controllers/problemController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProblems);
router.get('/:id', getProblem);
router.post('/', protect, admin, createProblem);
router.put('/:id', protect, admin, updateProblem);
router.delete('/:id', protect, admin, deleteProblem);

module.exports = router;

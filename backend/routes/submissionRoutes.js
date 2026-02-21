const express = require('express');
const {
  submitSolution,
  getUserSubmissions,
  getProblemSubmissions,
  getSubmission,
} = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, submitSolution);
router.get('/user/:userId', protect, getUserSubmissions);
router.get('/problem/:problemId', protect, getProblemSubmissions);
router.get('/:id', protect, getSubmission);

module.exports = router;

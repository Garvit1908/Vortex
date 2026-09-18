const express = require('express');
const router = express.Router();
const { matchSkillsAndGigs } = require('../controllers/aiController');

// AI Skill & Gig Matching Route
router.post('/match', matchSkillsAndGigs);

// Placeholder empty route for AI resume-parsing
router.post('/parse-resume', (req, res) => {
  // TODO: Implement AI resume parser using NLP/LLM pipeline
  res.status(501).json({
    success: false,
    message: 'AI resume parsing is pending implementation (placeholder route).',
    status: 'TODO',
  });
});

module.exports = router;

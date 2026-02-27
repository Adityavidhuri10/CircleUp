const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middlewares/authMiddleware');
const aiController = require('../controllers/aiController');

const router = express.Router();

// Rate limit: 20 AI requests per 15 minutes per IP
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        status: 'fail',
        message: 'Too many AI requests. Please try again in 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/ai/find-similar-users
router.post('/find-similar-users', protect, aiLimiter, aiController.findSimilarUsers);

module.exports = router;

const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(protect);

// C7 fix: GET (not POST) — logged-in user from req.user, friendId from params
router.get('/:friendId', messageController.getPrivateMessages);

module.exports = router;

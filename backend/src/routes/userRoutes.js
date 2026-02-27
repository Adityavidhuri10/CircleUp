const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(protect);

// ── Named routes FIRST (before /:id wildcard) — M5 fix ─────────────────────

// All users
router.get('/all', userController.getAllUsers);

// Friend request management
router.post('/friend-request/send', userController.sendFriendRequest);
router.post('/friend-request/accept', userController.acceptFriendRequest);
router.post('/friend-request/reject', userController.rejectFriendRequest);

// Legacy POST /singleUser kept for any remaining callers
router.post('/singleUser', userController.getSingleUser);

// ── Parametric routes AFTER named routes — prevents /:id matching /all etc ──

// User CRUD
router.get('/:id', userController.getSingleUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteAccount);

// Goals (nested under /:id)
router.post('/:id/goals', userController.addGoal);
router.delete('/:id/goals', userController.deleteGoal);
router.put('/:id/goals', userController.updateGoal);

// Location (nested under /:id)
router.put('/:id/location', userController.changeLocation);

// Password change (via auth token — no OTP here; auth flow handled by /api/auth/change-password)
router.post('/:id/change-password', userController.changePassword);

// Friend management (nested under user)
router.delete('/:id/friends/:friendId', userController.removeFriend);
router.get('/:id/friend-requests', userController.getFriendRequests);
router.post('/:id/toggle-name', userController.toggleNameVisibility);

module.exports = router;

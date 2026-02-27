const express = require('express');
const communityController = require('../controllers/communityController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(protect);

// C4 fix: all routes under /api/communities (matches frontend service)
router.get('/', communityController.getAllCommunities);
router.post('/', communityController.createCommunity);
router.post('/my', communityController.getUserCommunities);
router.post('/:communityId/users', communityController.addUsersToCommunity);
router.get('/:communityId/messages', communityController.getCommunityMessages);

// ── New Membership Management ────────────────────────────────────────────────
router.delete('/:communityId/leave', communityController.leaveCommunity);
router.delete('/:communityId/users/:userId', communityController.removeMember);

// ── Participation Flow ───────────────────────────────────────────────────────
router.get('/:communityId/eligible-members', communityController.getEligibleMembers);
router.post('/:communityId/join', communityController.joinCommunity);
router.post('/:communityId/request', communityController.requestToJoin);
router.post('/:communityId/requests/:userId/manage', communityController.manageJoinRequest);

module.exports = router;

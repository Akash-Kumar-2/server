const express = require('express');
const authController = require('./../controllers/authController');
const friendController = require('./../controllers/friendController');

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo('user'));


router.patch('/:id/send-request', friendController.sendFriendRequest);
router.patch('/:id/accept-request', friendController.acceptFriendRequest);
router.patch('/:id/decline-request', friendController.declineFriendRequest);
router.patch('/:id/unfriend', friendController.unFriend);

module.exports = router;

const express = require('express');
const authController = require('./../controllers/authController');
const friendController = require('./../controllers/friendController');

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo('user'));


router.patch('/send-request/:id', friendController.sendFriendRequest);
router.patch('/accept-request/:id', friendController.acceptFriendRequest);
router.patch('/decline-request/:id', friendController.declineFriendRequest);
router.patch('/unfriend/:id', friendController.unFriend);

module.exports = router;

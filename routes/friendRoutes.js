const express = require('express');
const authController = require('./../controllers/authController');
const friendController = require('./../controllers/friendController');

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo('user'));


router.post('/send-request', friendController.sendFriendRequest);
router.post('/accept-request', friendController.acceptFriendRequest);
router.post('/decline-request', friendController.declineFriendRequest);

module.exports = router;

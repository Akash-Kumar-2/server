const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const friendController = require('./../controllers/friendController');
const upload = require('./../utils/uploadConfig');

const router = express.Router();

router.post('/signup', authController.signup);
router.get("/verifyemail/:Code",authController.verifyEmailHandler);
router.post('/login', authController.login);
router.get('/logout',authController.logout);
router.post('/forgetpassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
//instead of using authcontroller.protect for every route below this point we can simply do

router.use(authController.protect);


router.patch('/:id/send-request',authController.restrictTo('user'), friendController.sendFriendRequest);
router.patch('/:id/accept-request',authController.restrictTo('user'), friendController.acceptFriendRequest);
router.patch('/:id/decline-request',authController.restrictTo('user'), friendController.declineFriendRequest);
router.patch('/:id/unfriend',authController.restrictTo('user'), friendController.unFriend);

router.patch(
  '/updateMyPassword',
  authController.updatePassword
);

router.get("/suggested",authController.restrictTo('user'), userController.getSuggestedUsers);

router.route('/me').get(
  userController.getMe,
  userController.getUser
);
router.patch(
  '/updateMe',
  upload.fields([
   {name: 'profile_photo',maxCount:1},
   {name: 'background_photo',maxCount:1}
  ]),
  userController.updateMe
);
router.delete(
  '/deleteMe', 
  userController.deleteMe
);

//Administer can only use below actions so

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router
  .route('/:id/freeze/unfreeze')
  .patch(userController.freezeAccount);
  

module.exports = router;

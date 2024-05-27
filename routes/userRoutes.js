const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.get("/verifyemail/:Code",authController.verifyEmailHandler);
router.post('/login', authController.login);
router.get('/logout',authController.logout);
router.post('/forgetpassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
//instead of using authcontroller.protect for every route below this point we can simply do

router.use(authController.protect);

router.patch(
  '/updateMyPassword',
  authController.updatePassword
);

router.route('/me').get(
  userController.getMe,
  userController.getUser
);
router.patch(
  '/updateMe',
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

module.exports = router;

const express = require('express');
const postController = require('./../controllers/postController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/:id')
  .get(postController.getPost)
  .delete(authController.protect, postController.deletePost);

router.use(authController.protect);

router.route('/feed').get(postController.getFeedPosts);
router.route('/create').post(postController.createPost);
router.route('/user/:username').get(postController.getUserPosts);



router.route('/like/:id').put(postController.likePost);
router.route('/reply/:id').put(postController.replyToPost);  

module.exports = router;
const express = require('express');
const postController = require('./../controllers/postController');
const authController = require('./../controllers/authController');

const router = express.Router();


router.route('/feed').get(postController.getFeedPosts);
router.route('/create').post(postController.createPost);
router.route('/user/:username').get(postController.getUserPosts);

router
  .route('/:id')
  .get(postController.getPost)
  .delete(postController.deletePost);

router.put('/like/:id',postController.likePost);
router.put('/reply/:id',postController.replyToPost);  

module.exports = router;
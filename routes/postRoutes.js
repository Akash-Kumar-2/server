const express = require('express');
const postController = require('./../controllers/postController');
const commentController = require('./../controllers/commentController');
const authController = require('./../controllers/authController');
const upload = require('./../utils/uploadConfig'); // Import the multer configuration

const router = express.Router();

router
  .route('/:id')
  .get(postController.getPost)
  .delete(authController.protect, postController.deletePost);

router.use(authController.protect);

router.route('/feed').get(postController.getFeedPosts);
router.route('/create').post(upload.single('img'), postController.createPost); // Use multer middleware here
router.route('/user/:username').get(postController.getUserPosts);


router.route('/:id/addlike').put(postController.likeUnlikePost);

router.route('/:id/addcomment').post(upload.single('commentimg'),commentController.replyToPost);
router.route('/:postId/comment/:commentId/delete').delete(commentController.deleteReply);

module.exports = router;
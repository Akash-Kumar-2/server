const Post = require('./../model/postModel');
const User = require('./../model/userModel');
const Comment = require('../model/commentModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const { uploadOnCloudinary,deleteFromCloudinary } = require('./../utils/cloudinaryConfig');

exports.replyToPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { comment_text } = req.body;
  const userId = req.user._id;

  // Check if the post ID is provided
  if (!id) {
    return next(new AppError('Please provide post ID', 400));
  }

  // Find the post by ID
  const post = await Post.findById(id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  let imgData = {};
  if (req.file) {
    const uploadedResponse = await uploadOnCloudinary(req.file.path);
    if (uploadedResponse) {
      imgData = {
        filename: uploadedResponse.public_id,
        url: uploadedResponse.secure_url
      };
    } else {
      return next(new AppError('Image upload failed', 500));
    }
  }

  // Create a new reply/comment
  const newcomment = await Comment.create({
    creator_name: user.name,
    creator_profile_photo: {
      filename: user.profile_photo.filename,
      url: user.profile_photo.url || ''
    },
    creator_id: userId,
    created_on: id,
    created_at: new Date(),
    comment_text,
    comment_img: imgData
  });

  // Push the comment's ID into the post's replies array
  post.Comments.push(newcomment._id);
  await post.save();

  // Respond with the new reply/comment
  res.status(201).json({
    status: 'success',
    data: {
      comment: newcomment,
      post
    }
  });
});

exports.deleteReply = catchAsync(async (req, res, next) => {
  const { postId, commentId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError('Post Not Found', 404));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new AppError('Comment Not Found', 404));
  }

  // Check if the comment exists in the post's Comments array
  const existsInPost = post.Comments.some(comment => comment._id.equals(commentId));
  if (!existsInPost) {
    return next(new AppError('No such comment is found', 400));
  }

  // Check if the current user has permission to delete the comment
  if (!(post.postedBy.equals(req.user._id)) && !(comment.creator_id.equals(req.user._id))) {
    return next(new AppError('Unauthorized Action', 401));
  }

  // Delete the comment image from Cloudinary if it exists
  if (comment.comment_img && comment.comment_img.url) {
    const imgId = comment.comment_img.url.split('/').pop().split('.')[0];
    const deleteSuccess = await deleteFromCloudinary(imgId);
    if (!deleteSuccess) {
      return next(new AppError('Failed to delete image from Cloudinary', 500));
    }
  }

  // Delete the comment
  await Comment.findByIdAndDelete(commentId);

  // Remove the comment ID from the post's Comments array
  post.Comments.pull(commentId);
  await post.save();

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

exports.likeComment = catchAsync(async (req ,res ,next) => {
  
  res.status(200).json({
    status: 'success',
    message:'route not defined yet'
  });
});


const Post = require('./../model/postModel');
const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const cloudinary = require('cloudinary').v2;

exports.createPost = catchAsync(async (req, res, next) => {
  
    const { userId, text } = req.body;
    let image = req.body.img;

    if(!userId || !text)
        {
            return next(new AppError('Post should be posted by a  user , Post should have some text',400));
        }

    const user = await User.findById(userId);
    if(!user)
        {
            return next(new AppError('User not found',404));
        }
    if(user._id.toString()!==req.user._id.toString())
        {
            return next(new AppError('Unauthorized Access!!!!!',401));
        }
    if(text.length>500)
        {
            return next(new AppError('Text should be within 500 characters',400));
        }
    if(image)
        {
            const uploadedResponse = await cloudinary.uploader.upload(image);
            img = uploadedResponse.secure_url;
        }
        const newPost = await Post.create({
            postedBy: userId,
            img: image,
            text: text
        });
        
        res.status(201).json({
          status: 'success',
          data:{
            newPost
          }
        });
});

exports.getPost = catchAsync(async (req, res, next) => {
res.status(404).json({
    status: 'success',
    message: 'Route Not Defined yet'
});
});

exports.deletePost = catchAsync(async (req, res, next) => {
    res.status(404).json({
        status: 'success',
        message: 'Route Not Defined yet'
    });
    });
exports.likePost = catchAsync(async (req, res, next) => {
        res.status(404).json({
            status: 'success',
            message: 'Route Not Defined yet'
        });
        });   
exports.replyToPost = catchAsync(async (req, res, next) => {
            res.status(404).json({
                status: 'success',
                message: 'Route Not Defined yet'
    });
    });
exports.getUserPosts = catchAsync(async (req, res, next) => {
        res.status(404).json({
            status: 'success',
            message: 'Route Not Defined yet'
        });
        });
exports.getFeedPosts = catchAsync(async (req, res, next) => {
            res.status(404).json({
                status: 'success',
                message: 'Route Not Defined yet'
            });
            });        
    
const Post = require('./../model/postModel');
const User = require('./../model/userModel');
const Comment = require('../model/commentModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const { uploadOnCloudinary, deleteFromCloudinary } = require('./../utils/cloudinaryConfig');

exports.createPost = catchAsync(async (req, res, next) => {
  
    const { userId, text} = req.body;
    

    if(!userId)
        {
            return next(new AppError('Post should be posted by a  user',400));
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
    if(text && text.length>500)
        {
            return next(new AppError('Text should be within 500 characters',400));
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

    const newPost = await Post.create({
        postedBy: userId,
        img: imgData,
        text: text || ''
    });

    res.status(201).json({
        status: 'success',
        data: {
            newPost
        }
    });
});

exports.getPost = catchAsync(async (req, res, next) => {

    const postId = req.params.id; 
    const post = await Post.findById(postId);
    if(!post)
        {
            return next(new AppError('Post Not Found!!!',404));
        }
    

res.status(200).json({
    status: 'success',
    data: {
        post
    }
});
});

exports.deletePost = catchAsync(async (req, res, next) => {
    const postId = req.params.id; 
    const post = await Post.findById(postId);
    if(!post)
        {
            return next(new AppError('Post Not Found!!!',404));
        }
    if(post.postedBy.toString()!==req.user._id.toString())
        {
            return next(new AppError('unauthorised Action',401));
        }
   
        if (post.img && post.img.url) {
            const imgId = post.img.url.split('/').pop().split('.')[0];
            const deleteSuccess = await deleteFromCloudinary(imgId);
            if (!deleteSuccess) {
                return next(new AppError('Failed to delete image from Cloudinary', 500));
            }
        }  

        await Post.findByIdAndDelete(postId);

res.status(200).json({
    status: 'success',
    message: 'Deleted'
});
    });
exports.likeUnlikePost = catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const userId = req.user._id
      if(!id)
        {
            return next(new AppError('Please provide post id',400));
        }
      const post = await Post.findById(id);
      if(!post)
        {
            return next(new AppError('Post Not Found',404));
        }
       
        const userLiked = post.likes.includes(userId);

        if (userLiked) {
			// Unlike post
			await Post.updateOne({ _id: id }, { $pull: { likes: userId } });
			
		} else {
			// Like post
			post.likes.push(userId);
			await post.save();
		}

        res.status(200).json({
            status: 'success',
            message: 'Liked/Unliked Successfully',
            
           
        });
        });   
// exports.replyToPost = catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const { comment_text } = req.body;
//     const userId = req.user._id;

//     // Check if the post ID is provided
//     if (!id) {
//         return next(new AppError('Please provide post ID', 400));
//     }

//     // Find the post by ID
//     const post = await Post.findById(id);
//     if (!post) {
//         return next(new AppError('Post not found', 404));
//     }

//     // Create a new reply/comment
    
//     const user = await User.findById(userId);

//     const newReply = await Comment.create({
//         creator_name:user.name,
//         creator_profile_photo:user.profilePic,
//         creator_id: userId,
//         created_on: id,
//         created_at: new Date(),
//         comment_text
//     });
//     let imgData = {};
    
//     // Respond with the new reply/comment
//     res.status(201).json({
//         status: 'success',
//         data: {
//             reply: newReply
//         }
//     });
//     });
exports.getUserPosts = catchAsync(async (req, res, next) => {

    const { username } = req.params;
	
		const user = await User.findOne({ username });
		if (!user) {
			return next(new AppError('user not found !!!!',404));
		}

		const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });


        res.status(200).json({
            status: 'success',
            data:{
                posts
            }
        });
        });
exports.getFeedPosts = catchAsync(async (req, res, next) => {
            res.status(404).json({
                status: 'success',
                message: 'Route Not Defined yet'
            });
            });        
    
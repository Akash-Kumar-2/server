const Post = require('./../model/postModel');
const User = require('./../model/userModel');
const Comment = require('../model/commentModel');
const AppError = require('./../utils/appError');
const Notification = require("../model/notificationModel");
const catchAsync = require('./../utils/catchAsync');
const { uploadOnCloudinary, deleteFromCloudinary } = require('./../utils/cloudinaryConfig');

exports.createPost = catchAsync(async (req, res, next) => {
  
    const { userid } = req.params;
    const { newPostText, postCategory } = req.body;
    

    if(!userid || (!newPostText && typeof req.file === "undefined"))
        {
            return next(new AppError('Post should be posted by a  user , Post should have some text or image',400));
        }

    const user = await User.findById(userid);
    if(!user )
        {
            return next(new AppError('User not found',404));
        }
    if(user._id.toString()!==req.user._id.toString())
        {
            return next(new AppError('Unauthorized Access!!!!!',401));
        }
    if(newPostText?.length>500)
        {
            return next(new AppError('Text should be within 500 characters',400));
        }
       
    //     let imgData = {};
    //     if (req.file) {
    //         const uploadedResponse = await uploadOnCloudinary(req.file.path);
    //         if (uploadedResponse) {
    //             imgData = {
    //                 filename: uploadedResponse.public_id,
    //                 url: uploadedResponse.secure_url
    //             };
    //         } else {
    //             return next(new AppError('Image upload failed', 500));
    //         }
    //     }

    // const newPost = await Post.create({
    //     postedBy: userid,
    //     img: imgData,
    //     text: text || ''
    // });
     
    const newPost = new Post({
        created_by: currUser,
        created_at: new Date(Date.now()),
        post_text: newPostText,
        category: postCategory,
      });
    
      if (typeof req.file != "undefined") {
        newPost.post_img = {
          filename: req.file.filename || "ATG_Post_Img",
          url: req.file.path,
        };
      }
    
      await newPost.save();

      const notification = new Notification({
        category: "Posted",
        sent_by: currUser,
        sent_at: new Date(Date.now()),
        url: `/post/${newPost?.id}`,
      });
    
      const friends = currUser?.friends;
    
      friends.forEach(async (f) => {
        await User.findByIdAndUpdate(f?.id, {
          $push: { notifications: notification },
        });
      });
    
      await notification.save();
    
      currUser.posts.push(newPost);
      await currUser.save();

    res.status(201).json({
        status: 'success',
        msg: 'OK',
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
    msg:'OK',
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
    if(post.created_by.toString()!==req?.user?._id.toString())
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
        await User.updateMany(
            {},
            { $pull: { posts: postId, saved: postId, favorites: postId } }
          );
         
        await Comment.deleteMany({ created_on: postId});  
res.status(200).json({
    status: 'success',
    message: 'Deleted',
    msg:'OK'
});
    });
exports.likeUnlikePost = catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const userId = req.user._id
      if(!id)
        {
            return next(new AppError('Please provide post id',400));
        }
        let currUser = await User.findById(userId);

        if (!currUser) {
          return next(new AppError("User not found", 404));
        }
      const post = await Post.findById(id);
      if(!post)
        {
            return next(new AppError('Post Not Found',404));
        }
       

        const userLiked = post.likes.includes(currUser);

        if (userLiked) {
			// Unlike post
			await Post.updateOne({ _id: id }, { $pull: { likes: currUser } });
			
		} else {
			// Like post
			post.likes.push(currUser);
			await post.save();
		}

        let postOwner = await Post.findById(id)
    .select("created_by")
    .populate("created_by");

  if (postOwner?.created_by?.id !== userid) {
    let notification = new Notification({
      category: "Liked",
      sent_by: currUser,
      sent_at: new Date(Date.now()),
      url: `/post/${postid}`,
    });

    await notification.save();

    await User.findByIdAndUpdate(postOwner.created_by, {
      $push: { notifications: notification },
    });
  }

        res.status(200).json({
            status: 'success',
            message: 'Liked/Unliked Successfully',
            msg: 'OK'
           
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

exports.fetchJobs = catchAsync(async( req, res, next) => {
    let { category } = req.params;
    let jobs;
    if (category === "all") {
      jobs = await Post.find({
        category: {
          $in: [
            "Web Development",
            "Content Writing",
            "Full Stack Development",
            "Marketing",
            "Designing",
            "SEO Optimization",
            "Data Entry",
          ],
        },
      })
        .populate("created_by")
        .populate("comments")
        .populate("likes");
    } else {
      jobs = await Post.find({
        category: category,
      })
        .populate("created_by")
        .populate("comments")
        .populate("likes");
    }
  
    jobs?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
    res.status(200).json({
      status:'success',  
      msg: "OK",
      data:{
      jobs
      }
    });
  });       

  // feeds for the home page.
exports.getFeedPosts = catchAsync(async (req, res, next) => {
    let posts = await Post.find({})
    .populate("created_by")
    .populate("comments")
    .populate("likes");

  posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.status(200).json({ msg: "OK", posts });
});

exports.addToSavedPost = catchAsync(async (req, res, next) => {
  const { userid } = req.params;
  const { postid } = req.body;

  if (!userid || !postid) {
    return next(new AppError("User is must , Post is must", 400));
  }

  let post = await Post.findById(postid);

  if (!post) {
    return next(new AppError("Invalid Post", 400));
  }

  let currUser = await User.findById(userid).populate("saved");

  if (!currUser) {
    return next(new AppError("User not found", 404));
  }

  let flag = 0;
  currUser?.saved?.forEach((s) => {
    if (s.id === postid) {
      flag = 1;
    }
  });

  if (flag === 1) {
    return res.status(200).json({ msg: "Already Saved" });
  }

  await User.findByIdAndUpdate(userid, {
    $push: { saved: post },
  });

            res.status(200).json({
                status: 'success',
                msg: 'OK'
            });
            });        
    
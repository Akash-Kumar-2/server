const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const { uploadOnCloudinary, deleteFromCloudinary } = require('./../utils/cloudinaryConfig');


const filterObj = (Obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(Obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = Obj[el];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) create error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Password cannot be changed through this route, use /updateMyPassword route.',
        400
      )
    );
  }

  //2) filter out unwanted field names that are not allowed to be updated.
  const filteredBody = filterObj(req.body, 'name', 'email','gender','bio','profile_photo','background_photo','mobile_no','userType','dob');
  
 //3) Handle profile photo update
 if (req.files && req.files.profile_photo) {
  const currentUser = await User.findById(req.user.id);
  if (currentUser.profile_photo.url) {
    await deleteFromCloudinary(currentUser.profile_photo.filename);
  }
  const uploadedImage = await uploadOnCloudinary(req.files.profile_photo[0].path);
  if (!uploadedImage) {
    return next(new AppError('Error uploading profile picture to Cloudinary', 500));
  }
  filteredBody.profile_photo = {
    filename: uploadedImage.public_id,
    url: uploadedImage.secure_url
  };
}
//4) Handle background photo update
if (req.files && req.files.background_photo) {
  const currentUser = await User.findById(req.user.id);
  if (currentUser.background_photo.url && currentUser.background_photo.url !== "https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D") {
    await deleteFromCloudinary(currentUser.background_photo.filename);
  }
  const uploadedImage = await uploadOnCloudinary(req.files.background_photo[0].path);
  if (!uploadedImage) {
    return next(new AppError('Error uploading background picture to Cloudinary', 500));
  }
  filteredBody.background_photo = {
    filename: uploadedImage.public_id,
    url: uploadedImage.secure_url
  };
}


  //5) update data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
   
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  });
  
  exports.createUser = catchAsync(async (req, res, next) => {
    
    res.status(500).json({
      status: 'error',
      message: 'Use /signup to create user'
    });
  });
  
  exports.getUser =  catchAsync(async (req, res, next) => {
    let query = User.findById(req.params.id);
    // if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('Document not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });
  
  exports.updateUser =   catchAsync(async (req, res, next) => {
    const doc = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //runValidators basically checks all the tour fields with their validators once we try to update it
      runValidators: true
    });
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
  
  exports.deleteUser =  catchAsync(async (req, res, next) => {
    const doc = await User.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  exports.getSuggestedUsers = catchAsync(async(req, res, next) => {
     // exclude the current user from suggested users array and exclude users that current user is already following
		const userId = req.user._id;

		const userfriends = await User.findById(userId).select('friends');

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
          role:{ $ne: 'admin'},
          isFrozen:{$ne: true}
				},
			},
			{
				$sample: { size: 10 },
			},
		]);
		const filteredUsers = users.filter((user) => !userfriends.friends.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);


		res.status(200).json({
      status: 'success',
      result:suggestedUsers.length,
      data:{
        suggestedUsers

      }
      });
  });

  exports.freezeAccount = catchAsync(async( req, res, next) =>{
    const user = await User.findById(req.params.id);
		if (!user) {
			return next(new AppError('User not Found',404));
		}
    if(!user.isFrozen)
		{user.isFrozen = true;
      await user.save();

		res.status(200).json({ 
      status: 'Success',
      message: 'Account Frozen' 
    });
    }
    else
    {user.isFrozen = false;
      await user.save();

		res.status(200).json({ 
      status: 'Success',
      message: 'Account unFrozen' 
    });
    }
		
  });



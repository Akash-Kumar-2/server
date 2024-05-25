const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

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
  const filteredBody = filterObj(req.body, 'name', 'email','gender','role','bio','profilePic');
  //3) update data
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
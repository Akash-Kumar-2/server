const User = require('./../model/userModel');
const { promisify} = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const crypto = require('crypto');
const sendEmail = require('./../utils/sendMail');
const { uploadOnCloudinary} = require('./../utils/cloudinaryConfig');

const signToken = id =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      //so that data cannot be modified in cookie
      httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
  
    //remove password from output
    user.password = undefined;
  
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  };

exports.signup = catchAsync(async(req, res, next) =>{
  const picname = req.body.name.split(" ")[0];
  const gender = req.body.gender;

  const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${picname}`;
  const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${picname}`;
    
  const imageUrl = gender === "male" ? boyProfilePic : girlProfilePic;

  const uploadedImage = await uploadOnCloudinary(imageUrl);
  if (!uploadedImage) {
    return next(new AppError('Error uploading profile picture to Cloudinary', 500));
  }
    
    

    const newUser = await User.create({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm:req.body.passwordConfirm,
      gender:req.body.gender,
      userType: req.body.userType,
      profile_photo: {
        url: uploadedImage.secure_url
      }
    });
    
    const verificationCode = newUser.createVerificationCode();
    await newUser.save({ validateBeforeSave: false });
    
    const redirectUrl = `${req.protocol}://${req.get('host')}/api/v1/users/verifyemail/${verificationCode}`;

    const to = newUser.email;
    const subject = "Account verification link";
    const message = ` Kindly click on the link ${redirectUrl} to verify your account status`;
    sendEmail(to, subject, message);
    
    console.log(redirectUrl);
    createSendToken(newUser,201,res);
});

exports.login = catchAsync(async(req,res, next) => {
  const password = req.body.password;
  const identifier = req.body.username;
  // const {username, password} = req.body;
// if (!username || !password) {
//     return next(new AppError('Please enter the email and password', 400));
//   }
  if (!identifier || !password) {
    return next(new AppError('Please enter the email and password', 400));
  }
  // const user = await User.findOne({ username: username }).select('+password');

  //we can login using either email or username
  const user = await User.findOne({ 
    $or:[
     {email: identifier},
     {username: identifier}
    ]
    }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }
  //3)if verified, send response to client
  console.log(user.active);

  if (!user.active) {
    return next(
      new AppError(
        `Your Email is not verified yet Check your ${user.email} for link `,
        401
      )
    );
  }
  createSendToken(user, 200, res);

});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req,res,next) => {
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
      token = req.headers.authorization.split(' ')[1];
    }else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
  if(!token)
    {
      return next(new AppError('You are not logged in',401));
    }
    
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
    res.locals.user = freshUser;
    req.user = freshUser;
    next();
});
exports.restrictTo = (...roles) => {
  //middleware
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1) get user through email

  const identifier = req.body.username;
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }]});
  if (!user) {
    return next(new AppError('User not found! ', 404));
  }
  //2)Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3)send it to your's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
     
    const to = user.email;
    const subject = "Reset Token. Do not Share!!!!!";
    const message = `Forget your password? Submit a PATCH request with your new password and password confirm to: ${resetURL}.\n
    If you didn't forget your password ignore this email!`;
    sendEmail(to, subject, message);

    res.status(200).json({
      status: 'Success',
      message: 'token send to email!'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  //2)If token is not expired and there is user , set the new password
  if (!user) {
    return next(new AppError('Token Expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3)update changedPasswordAt property of the user in userModel
  //4)log in the user,send Jwt
  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
});

exports.verifyEmailHandler = catchAsync(async (req, res, next) => {
  //1)Get user based on the code
  const verificationCode = crypto
    .createHash("sha256")
    .update(req.params.Code)
    .digest("hex");



  const user = await User.findOne({
    verificationCode:verificationCode,
  });

  if (!user) {
    return next(new AppError("Invalid Registration Link...", 400));
  }
  user.active = true;
  user.verificationCode = null;
  await user.save({ validateBeforeSave: false });
  //4) log the user in send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2)check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your Current password is wrong', 401));
  }
  //3)if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4)log in user,send JWT
  createSendToken(user, 200, res);
});
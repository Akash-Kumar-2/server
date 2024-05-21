const User = require('./../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

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
    // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

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
    const newUser = await User.create({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role
    });

    createSendToken(newUser,201,res);
});

exports.login = catchAsync(async(req,res, next) => {
const {username, password} = req.body;
if (!username || !password) {
    return next(new AppError('Please enter the email and password', 400));
  }
  const user = await User.findOne({ username: username }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }
  //3)if verified, send response to client
  createSendToken(user, 200, res);

});
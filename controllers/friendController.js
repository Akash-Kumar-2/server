const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Send a friend request
exports.sendFriendRequest = catchAsync(async (req, res, next) => {
  const { recipientId } = req.body;

  if (!recipientId) {
    return next(new AppError('Recipient ID is required', 400));
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return next(new AppError('Recipient not found', 404));
  }

  // Add friend request to recipient's friend_requests field
  recipient.friend_requests.push({ sent_by: req.user.id, sent_at: Date.now() });

  await recipient.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Friend request sent'
  });
});

// Accept a friend request
exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
  const { requesterId } = req.body;

  if (!requesterId) {
    return next(new AppError('Requester ID is required', 400));
  }

  const requester = await User.findById(requesterId);
  if (!requester) {
    return next(new AppError('Requester not found', 404));
  }

  // Add to friends list
  req.user.friends.push(requesterId);
  requester.friends.push(req.user.id);

  // Remove the friend request
  req.user.friend_requests = req.user.friend_requests.filter(
    request => request.sent_by.toString() !== requesterId
  );

  // Save both users with validateBeforeSave set to false
  await req.user.save({ validateBeforeSave: false });
  await requester.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Friend request accepted'
  });
});

// Decline a friend request
exports.declineFriendRequest = catchAsync(async (req, res, next) => {
  const { requesterId } = req.body;

  if (!requesterId) {
    return next(new AppError('Requester ID is required', 400));
  }

  // Remove the friend request
  req.user.friend_requests = req.user.friend_requests.filter(
    request => request.sent_by.toString() !== requesterId
  );

  // Save the user with validateBeforeSave set to false
  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Friend request declined'
  });
});

const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Send a friend request
exports.sendFriendRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Please provide User Id of recipient', 400));
  }

  if (id === req.user._id.toString()) {
    return next(new AppError('Cannot send friend request to self', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const currUser = await User.findById(req.user._id);

   // Check if they are friends
   if (currUser.friends.includes(id)) {
    return next(new AppError('Friend request cannot be sent since friend exist', 400));
  }

  // Check if a friend request already exists
  if (user.friend_requests.some(request => request.sent_by.toString() === req.user.id)) {
    return next(new AppError('Friend request already sent', 400));
  }

  // Add friend request to recipient's friend_requests field
  user.friend_requests.push({ sent_by: req.user.id, sent_at: Date.now() });
  // Add friend request to sender's friend_requests field and marking isSent true
  currUser.friend_requests.push({ sent_by: id, sent_at: Date.now(), isSent: true });

  await user.save();
  await currUser.save();

  res.status(200).json({
    status: 'success',
    message: 'Friend request sent'
  });
});

// Accept a friend request
exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
  
  const { id } = req.params;
  const sender = await User.findById(id);
	const user = await User.findById(req.user._id);
  
  if(!sender)
    {
      return next(new AppError('User Does not exist', 404));
    }
  
      // Check if the friend request exists and isSent is false
  const request = user.friend_requests.find(request => request.sent_by.toString() === id && request.isSent === false);
  if (!request) {
    return next(new AppError('Request does not exist or has already been accepted', 404));
  }
  

  // // Check if the friend request exists
  // if (!user.friend_requests.map(request => request.sent_by.toString()).includes(id)) {
  //   return next(new AppError('Request does not exist', 404));
  // }

  // if(user.friend_requests.isSent)
  //   {
  //     return next(new AppError('Unauthorised action',400));
  //   }

  // const { requesterId } = req.body;

  // if (!requesterId) {
  //   return next(new AppError('Requester ID is required', 400));
  // }

  // const requester = await User.findById(requesterId);
  // if (!requester) {
  //   return next(new AppError('Requester not found', 404));
  // }

  // Add to friends list
  user.friends.push(id);
  sender.friends.push(req.user.id);

  // Remove the friend request
  user.friend_requests = user.friend_requests.filter(
    request => request.sent_by.toString() !== id
  );
  sender.friend_requests = sender.friend_requests.filter(
    request => request.sent_by.toString() !== req.user.id
  );

  // Save both users with validateBeforeSave set to false
  await user.save();
  await sender.save();

  res.status(200).json({
    status: 'success',
    message: 'Friend request accepted'
  });
});

// Decline a friend request
exports.declineFriendRequest = catchAsync(async (req, res, next) => {

  const { id } = req.params;

  const sender = await User.findById(id);
  const user = await User.findById(req.user._id);

  if (!sender) {
    return next(new AppError('User does not exist', 404));
  }

  if (!user.friend_requests.some(request => request.sent_by.toString() === id)) {
    return next(new AppError('Request does not exist', 404));
  }

  // const { requesterId } = req.body;

  // if (!requesterId) {
  //   return next(new AppError('Requester ID is required', 400));
  // }

 // Remove the friend request
 user.friend_requests = user.friend_requests.filter(request => request.sent_by.toString() !== id);
 sender.friend_requests = sender.friend_requests.filter(request => request.sent_by.toString() !== req.user.id);

 // Save the user with validateBeforeSave set to false
 await user.save();
 await sender.save();

 res.status(200).json({
   status: 'success',
   message: 'Friend request declined'
 });
});

exports.unFriend = catchAsync(async(req, res, next) => {

  const { id } = req.params;

  if (!id) {
    return next(new AppError('Please provide User Id of the friend to remove', 400));
  }

  const user = await User.findById(req.user._id);
  const friend = await User.findById(id);

  if (!friend) {
    return next(new AppError('Friend not found', 404));
  }

  // Check if they are friends
  if (!user.friends.includes(id)) {
    return next(new AppError('You are not friends with this user', 400));
  }

  // Remove friend from both users' friend lists
  user.friends = user.friends.filter(friendId => friendId.toString() !== id);
  friend.friends = friend.friends.filter(friendId => friendId.toString() !== req.user._id.toString());

  // Save both users with validateBeforeSave set to false
  await user.save();
  await friend.save();

  res.status(200).json({
    status: 'success',
    message: 'Unfriended successfully'
  });
});

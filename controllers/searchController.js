const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

// Controller function to handle search query
exports.searchQuery = catchAsync(async (req, res, next) => {
  const keyword = req.query.keyword;
  if (!keyword) {
    return next(new AppError('Keyword is required', 400));
  }

  // Perform a case-insensitive search on name, username, or email
  const results = await User.find({
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { username: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } }
    ]
  });

  // Return the search results
  res.status(200).json({
    status: 'success',
    results: results.length,
    data: results,
  });
});

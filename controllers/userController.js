const User = require('./../model/userModel');

exports.getAllUsers = async (req, res) => {
   
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  };
  
  exports.createUser = async (req, res) => {
    
    const user = await User.create(req.body);


    res.status(201).json({
      status: 'success',
      data: {
        user
      }
    });
  };
  
  exports.getUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'Route not defined yet '
    });
  };
  
  exports.updateUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'Route not defined yet '
    });
  };
  
  exports.deleteUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'Route not defined yet '
    });
  };
const express = require('express');
const authController = require('./../controllers/authController');
const searchController = require('./../controllers/searchController');

const router = express.Router();

router.use(authController.protect);

router.route('/').get(searchController.searchQuery);

module.exports = router;
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const userController = require('../controllers/userController');

// // TODO REGISTER ROUTE

// router.route('/register').post(userController.createUser);

// TODO LOGIN ROUTE

router.route('/login').post(authController.login);

// TODO EDIT ROUTE -- LATER HALF

router.route('/edit').post((req, res, next) => {});

// TODO GET ROUTE

router.route('/').get((req, res, next) => {
  console.log(req);
});

module.exports = router;

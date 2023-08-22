const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const userController = require('../controllers/userController');

// router.route('/test').get(authController.authenticate, (req, res, next) => {
//   console.log(req.cookies.jwt);
//   return res.status(200).json({ data: 'tested' });
// });
router.route('/isLoggedIn').get(authController.isLoggedIn);

// TODO LOGIN ROUTE
router.route('/login').post(authController.login);

router.route('/logout').post(authController.logout);

// TODO EDIT ROUTE -- LATER HALF

router.route('/edit').patch(authController.authenticate, userController.edit);

module.exports = router;

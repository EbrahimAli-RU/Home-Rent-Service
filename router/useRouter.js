const express = require('express');
const router = express.Router();

const userController = require('./../controller/userControoller')
const authController = require('./../controller/authController');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.patch('/updatePassword', authController.protect, authController.updatePassword);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:resetToken', authController.resetPassword);


router.get('/me',authController.protect, userController.getMe)
router.patch('/updateMe', authController.protect, userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);

module.exports = router;
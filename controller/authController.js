const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'public/img/users'})
const { promisify } = require('util');
const crypto =require('crypto');

const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEMail = require('./../utils/email_1');

const signToken = id => { 
        return jwt.sign({id}, process.env.SECRET_KEY,
        { expiresIn: process.env.EXPIRE_IN })
    };

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);    
    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success',
        data: {
            User: newUser,
            token
        }
    })
})

exports.signin = catchAsync(async(req, res, next) => {
    const {email, password} = req.body;
        if(!email || !password) {
            return next(new AppError(`'Please provide your email or password'`, 401));
        }
        const user = await User.findOne({email}).select('password');
    
        if(!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError('Incorrect email or password', 401));
        } 
       const loggerInUser = await User.findOne({email});
        const token = signToken(user._id);
        res.status(200).json({
            status: 'success',
            data: {
                user: loggerInUser,
                token
            }
        })
})


exports.protect = catchAsync(async (req, res, next) => {
    let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if(!token) {
            return next(new AppError(`you are not logged in, please login first`), 401);
        }

        const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
        const currentUser = await User.findById(decoded.id);
        if(!currentUser) {
            return next(new AppError('The user belonging to this token no longer exit', 401))
        }
        const stilValid = currentUser.changedPasswordAfter(decoded.iat);
        if(stilValid) {
            return next(new AppError('User recently changed password,please log in again', 401))
        }
        req.user = currentUser;
        next();
})


exports.updatePassword = catchAsync(async(req, res, next) => {
    
    const user = await User.findById(req.user.id).select('+password');
    if(!( await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError(`Your current password is wrong`, 403));
    }
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    res.status(200).json({
        status: 'success',
        data: {
            message: 'You have successfully changed your password'
        }
    })
})

exports.forgotPassword = catchAsync(async(req, res, next) => {
    // 1) Get user based on posted email
    const user = await User.findOne({ email: req.body.email});
    if(!user) {
        return next(new AppError('There is no user with that email', 404))
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // 3) Send it to user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`
    try {
        await sendEMail({
            email: user.email,
            subject: `Your password reset token only valod for 10 minutes`,
            message: resetURL
        })
    
        res.status(200).json({
            status: 'success',
            message: 'Token has send to email'
        })
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpire = undefined;
        await user.save({ validateBeforeSave: false});

        return next(new AppError('There is problem to sending this mail', 500));
    }
})

exports.resetPassword = catchAsync(async(req, res, next) => {
    const hasedToken = crypto.createHash('sha256').update(req.params.resetToken)
    .digest('hex');

    const user = await User.findOne({resetPasswordToken: hasedToken, passwordResetTokenExpire: {$gt: Date.now() }});
    if(!user) {
        return next(new AppError('Token is invalid or expired'), 400);
    }
    user.password = req.body.password;
    user.confirmPassword = req.user.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    await user.save();


    const token = signToken(user._id);
        res.status(200).json({
            status: 'success',
            data: {
                user,
                token
            }
        })

})
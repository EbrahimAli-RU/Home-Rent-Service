const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');


// const multerStorage = multer.diskStorage({
//     destination: (req, file,  cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); 
//     }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb( new AppError('Not an image! Please upload only image', 400), false);
    }
}

const upload = multer({ 
    storage: multerStorage,
    fileFilter: multerFilter
 });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {

    if(! req.file) return next();

    req.file.filename = `user-${req.user.id}.jpeg` //-${Date.now()}
    sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({quality: 90})
    .toFile(`public/img/users/${req.file.filename}`)

    next();
}

exports.getMe = catchAsync (async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('rentals');
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
    })
})

exports.updateMe = catchAsync(async (req, res, next) => {
    if(req.file) req.body.photo = req.file.filename;
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {new: true, runValidators: true});
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
    })
})
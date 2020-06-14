const multer = require('multer');
const sharp = require('sharp');
const Rental = require('./../model/rentalModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// const multerStorage = multer.diskStorage({
//     destination: (req, files, cb) => {
//         cb(null, 'public/img/rentals');
//     },
//     filename: (req, files, cb) => {
//         let i =1;
//         const ext = files.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${files.originalname}.${ext}`);
//     }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, files, cb) => {
    if(files.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb( new AppError('Not an image! Please upload only image', 400), false);
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadRentalPhoto = upload.array('photo', 2);


exports.createRental = catchAsync (async (req, res, next) => {

    
    // if(req.files) {
    //     req.body.photo = [];
    //     req.files.map(el => req.body.photo.push(el.filename));
    // }
    if(!req.body.owner) req.body.owner = req.user.id;
    const newRental = new Rental(req.body);
    // await newRental.save();
    // res.status(201).json({
    //     status: 'success',
    //     data: {
    //         Rental: newRental
    //     }
    // })
    req.newRental = newRental;
    next();
})

exports.resizePhoto =catchAsync(async (req, res, next) => {
   
    if(req.files) {
        req.newRental.photo = []

        req.files.map((el, i) => {
            const ext = el.mimetype.split('/')[1];
            const filename = `rental-${req.newRental._id}-${i+1}.${ext}`

            sharp(el.buffer).rotate().toFile(`public/img/rentals/${filename}`)
            req.newRental.photo.push(filename);
        })
    }
    console.log(req.newRental);
    const newRental = await req.newRental.save();
    res.status(201).json({
        status: 'success',
        data: {
            Rental: newRental
        }
    })
})
exports.getAllRental = catchAsync(async (req, res, next) => {
    const place = req.query.location
    console.log(place)
    // const rentals = await Rental.find({ location : { $regex: /^Dhaka bo/i }}).populate({
    //     path: 'owner',
    //     select: 'name email'
    // });
    const rentals = await Rental.find({ location : new RegExp(place, "i") }).populate({
        path: 'owner',
        select: 'name email'
    });
    res.status(200).json({
        status: 'success',
        data: {
            Rental: rentals
        }
    })
})

exports.updateRental = catchAsync(async (req, res, next) => {
    const rentals = await Rental.findByIdAndUpdate(req.params.rentalId, req.body, {new: true, runValidators: true});
        res.status(200).json({
            status: 'success',
            data: {
                Rental: rentals
            }
    })
})

exports.deleteRental = catchAsync(async (req, res, next) => {

    await Rental.findByIdAndDelete(req.params.rentalId);
        res.status(200).json({
            status: 'success',
            data: null
    })
})

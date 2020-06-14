const express = require('express');
const router = express.Router();
const rentalController = require('./../controller/rentalController');
const authController = require('./../controller/authController');

router
.route('/')
.post(authController.protect, rentalController.uploadRentalPhoto, rentalController.createRental, rentalController.resizePhoto)
.get(rentalController.getAllRental);

router
.route('/:rentalId')
.patch(authController.protect, rentalController.updateRental)
.delete(authController.protect, rentalController.deleteRental);


module.exports = router;
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({   
    location: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone Number is required'],
        unique: true
    },
    room: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'users'
    },
    photo: [String]
})

// rentalSchema.pre(/^find/, function(next) {
//     console.log('Ebrahim');
//     this.populate({
//         path: 'owner',
//         select: 'name'
//     })
//     next();
// })

const Rental = mongoose.model(`rentals`, rentalSchema);
module.exports = Rental;
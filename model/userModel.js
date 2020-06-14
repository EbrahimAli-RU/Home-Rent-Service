const mongoose = require('mongoose');
const validator = require('validator')
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please provide your name'],
    },
    email: {
        type: String,
        required: [true, `Please provide your email address`],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide your email address']
    },
    password: {
        type: String,
        minlength: 8,
        required: true,
        select: false
    },
    confirmPassword: {
        type: String,
        minlength: 8,
        required: true,
        validate: {
           validator: function(value) {
                return this.password === value;
            },
            message: 'Confirm password is not same as password'
        }
    },
    passwordChangedAt: Date,
    photo: String,
    passwordResetToken: String,
    passwordResetTokenExpire: Date

}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

userSchema.virtual('rentals', {
    ref: 'rentals',
    foreignField: 'owner',
    localField: '_id'
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcryptjs.hash(this.password, 12);
    this.confirmPassword = undefined;

    next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPasswordDB) {
    return await bcryptjs.compare(candidatePassword, userPasswordDB);
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

userSchema.methods.changedPasswordAfter = function(JWTtimeStamp) {
    if(this.passwordChangedAt) {
        console.log('Ebrahim');
        const changeTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000)
        return JWTtimeStamp < changeTimeStamp;
    }

    return false
}
const User = mongoose.model('users', userSchema);
module.exports = User;
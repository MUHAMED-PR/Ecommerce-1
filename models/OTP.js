const mongoose = require('mongoose')

const otpVerificationSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdDate:{
        type:Date,
        default:Date.now,
        expires:30
    }
});

module.exports = mongoose.model('OTP', otpVerificationSchema)
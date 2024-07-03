const mongoose = require('mongoose')

const couponShcema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    couponName:{
        type:String,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    expiry:{
        type:Date,
        required:true
    },
    discountAmount:{
        type:Number,

    }

})


module.exports = mongoose.model('coupon',couponShcema)
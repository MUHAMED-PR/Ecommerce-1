const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponName: { type: String, required: true },
    couponCode: { type: String, required: true },
    description: { type: String },
    count: { type: Number, required: true },
    expiry: { type: Date, required: true },
    discountAmount: { type: Number, required:true},
    minCartValue:{type:Number,required:true},
    active: { type: Boolean, required: true, default: true }
});

couponSchema.pre('save', function(next) {
    if (new Date() > this.expiry) {
        this.active = false;
    }
    next();
});

module.exports = mongoose.model('coupon', couponSchema);

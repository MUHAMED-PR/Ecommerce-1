const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    offerName: {
        type: String,
        required: true
    },
    productName: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'products'
    },
    offerPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    status: {
        type: Boolean,
        required: true,
        default: true // Default value
    }
});



module.exports = mongoose.model('offers', offerSchema);

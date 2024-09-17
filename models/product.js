const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    images: {
        type: Array
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    is_status: {
        type: Boolean,
        default: false,
        required: true
    },
    offerPrice:{
        type:Number,
        default:0
    }
});




module.exports = mongoose.model('products', productSchema);

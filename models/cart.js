const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users'
    },
    product:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'products'
        },
        quantity:{
            type:Number,
            default:1
        }
    }]
})

module.exports = mongoose.model('Cart',cartSchema)
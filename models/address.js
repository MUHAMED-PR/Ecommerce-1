const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    address:[{
        name:{
            type:String,
            required:true
        },
        phone:{
            type:Number,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },email:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        street:{
            type:String,
            required:true
        },
        landmark:{
            type:String
        },
        phone1:{
            type:Number
        }
    }]
})

module.exports = mongoose.model('address',addressSchema)
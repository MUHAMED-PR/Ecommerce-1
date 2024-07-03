const mongoose = require('mongoose')
// const category = require('./category')
// const { ObjectId } = require('mongodb')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    images:{
        type:Array  
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
        // type:String,
        required:true,
        
    },
    is_status:{
        type:Boolean,
        default:false,
        required:true
    }
})
module.exports= mongoose.model('products',productSchema)
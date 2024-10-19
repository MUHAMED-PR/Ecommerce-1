const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    is_status:{
        type:Boolean,
        required:true,
        default:false
    },
    numOfProduct:{
        type:Number,
        required:true,
        default:0
    }
})

module.exports = mongoose.model('category',categorySchema)
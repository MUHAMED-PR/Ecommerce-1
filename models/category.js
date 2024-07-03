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
    }
})

module.exports = mongoose.model('category',categorySchema)
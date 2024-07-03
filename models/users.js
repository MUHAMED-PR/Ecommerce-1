const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    dateOfJoined:{
        type:Date,
        default:Date.now
    },
    is_admin:{
        type:Number,
        required:true,
        default:0
    },
    is_verified:{
        type:Number,
        required:true,
        default:0
    },
    is_blocked:{
        type:Boolean,
        required:true,
        default:false
    }
})

module.exports = mongoose.model('users',userSchema)
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    balance:{
        type:Number,
        required:true
    },
    transactions:[{
        method:{
            type:String,
            enum:['Credit','Debit']
        },
        reason:{
            type:String,
            enum:['Cash added to wallet', 'Purchase', 'Refund', 'Other'],
            required:true
        },
        date:{
            type:Date,
            default:Date.now
        },
        transactionAmount:{
            type:Number,
            required:true
        }
    }]
})

module.exports = mongoose.model('wallet',walletSchema)
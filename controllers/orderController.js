const orderModel = require('../models/order')
const cartModel = require('../models/cart')

const placeOrder =async(req,res)=>{
    try {
        const { user_id } = req.session
        // console.log(req.body,' is the content .....')
        const userCart = await cartModel.findOne({userId:user_id }).populate('product.productId').exec()
        // console.log(userCart.product,' is th e ')
        if(userCart){
            const orderPlacing = new orderModel({
                userId: user_id,
                products:[{}]
            })
        }

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    placeOrder
}
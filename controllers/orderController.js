const orderModel = require('../models/order');
const cartModel = require('../models/cart');
const addressModel = require('../models/address');
const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')




const placeOrder = async (req, res) => {
    try {
        const { user_id } = req.session;
        const { addressId, paymentOption, total } = req.body;
        // console.log('hello inam reached here!!!')

        const userCart = await cartModel.findOne({ userId: user_id }).populate('product.productId').exec();
        // console.log(userCart,' is hte userCart .....')
        if (userCart.product.length>0) {
            const userAddress = await addressModel.findOne({
                userId: user_id,
                'address._id': addressId
            }, {
                'address.$': 1 // Only return the matched address element
            });

            if (userAddress) {
                const address = userAddress.address[0]; // Get the matched address from the array
                const addressIs = {
                    phone: address.phone,
                    phone1: address.phone1,
                    fullName: address.name,
                    state: address.state,
                    city: address.city,
                    street: address.street,
                    pincode: address.pincode
                };

                const products = userCart.product.map(cartProduct => ({
                    productId: cartProduct.productId._id,
                    price: cartProduct.productId.price,
                    quantity: cartProduct.quantity,
                    orderStatus: 'Pending'
                }));

                const orderPlacing = new orderModel({
                    userId: user_id,
                    products: products,
                    paymentMethod: paymentOption,
                    shippingAddress: addressIs,
                    totalAmount: total
                });

                const saveddata = await orderPlacing.save();
                // console.log(saveddata,'is the saved data...')

                // Clear the user's cart
                await cartModel.updateOne({ userId: user_id }, { $set: { product: [] } });
                console.log("isthe order Placing :",orderPlacing)

                res.status(200).json({ message: 'Order placed successfully' });
            } else {
                res.status(404).json({ message: 'Address not found' });
            }
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const orderSuccessfulPage = async(req,res)=>{
    try {
        res.render('user/orderSuccessful')
    } catch (error) {
        console.log(error);
    }
}

const orderDetails = async(req,res)=>{
    try {
        const {user_id} = req.session
        const orderDetails = await orderModel.findOne({userId:user_id}).populate('products.productId').exec() 
        res.render('user/orderDetails',{orderDetails})
    } catch (error) {
        console.log(error);
    }
}

const adminOrderDetails = async(req,res)=>{
    try {
        
        const orders = await orderModel.find().populate('products.productId').populate('userId').exec() 
        // console.log(orders,' is the orders ')
        res.render('admin/order',{orders})
    } catch (error) {
        console.log(error)
    }
}

const changeOrderStatus = async (req, res) => {
    try {
        const { orderId, productId, status } = req.query;
        console.log(orderId, productId, status);
        // console.log(typeof orderId, ' is the type of orderId');

        const updateStatus = await orderModel.findOneAndUpdate(
            { _id: orderId, 'products.productId': productId },
            { $set: { 'products.$.orderStatus': status } },
            { new: true }
        );
        console.log(updateStatus, ' is the updatedStatus');

        if (updateStatus) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Order or Product not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    placeOrder,
    orderSuccessfulPage,
    orderDetails,
    adminOrderDetails,
    changeOrderStatus
};

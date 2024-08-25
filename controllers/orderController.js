const users = require('../models/users')
const orderModel = require('../models/order');
const cartModel = require('../models/cart');
const addressModel = require('../models/address');
const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')
const Razorpay = require('razorpay');


const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


const placeOrder = async (req, res) => {
    try {
        const { user_id } = req.session;
        const { addressId, paymentOption, total } = req.body;

        const userCart = await cartModel.findOne({ userId: user_id }).populate('product.productId').exec();

        if (userCart.product.length > 0) {
            const userAddress = await addressModel.findOne({
                userId: user_id,
                'address._id': addressId
            }, {
                'address.$': 1
            });

            if (userAddress) {
                const address = userAddress.address[0];
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
                    paymentStatus: paymentOption === 'Cash On Delivery' ? 'Not Paid' : 'Paid',
                    shippingAddress: addressIs,
                    totalAmount: total
                });

                const savedData = await orderPlacing.save();

                // Clear the user's cart
                await cartModel.updateOne({ userId: user_id }, { $set: { product: [] } });

                if (paymentOption === 'Razorpay') {
                    const options = {
                        amount: total * 100, // amount in smallest currency unit
                        currency: "INR",
                        receipt: `order_rcptid_${savedData._id}`
                    };

                    try {
                        const order = await razorpayInstance.orders.create(options);
                        res.status(200).json({ message: 'Order placed successfully', orderId: order.id, keyId: process.env.RAZORPAY_KEY_ID });
                    } catch (error) {
                        console.error(error);
                        res.status(500).json({ message: 'Error creating Razorpay order' });
                    }
                } else if (paymentOption === 'Cash On Delivery') {
                    res.status(200).json({ message: 'Order placed successfully', orderId: savedData._id });
                }
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
        // console.log("id the queeeyyyrrrr things:",req.query)
        const {orderId,productId} = req.query
        const orderDetails = await orderModel.findOne({_id:orderId,products: {
            $elemMatch: { _id: productId }
          }})

    let arrayOfproducts = orderDetails.products
    let infoOfProduct;
      for(let i=0;i<arrayOfproducts.length;i++){
        if(arrayOfproducts[i].id == productId){
           infoOfProduct=arrayOfproducts[i]
           break;
        }
      }
// console.log("---+++---+",infoOfProduct)
        //   const aaa = await orderModel.findOne({"products._id":productId })
        // const dataa = await orderModel.findOne({_id:orderId})
        
        //   const aaa = await orderModel.findOne({products: {$elemMatch: { _id: productId }}})
        //   console.log("herere is hte ordere",orderDetails)
        // console.log("ishte object int he array of products:",aaa)
        res.render('user/orderDetails',{orderDetails,infoOfProduct})
    } catch (error) {
        console.log(error)
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

const viewOrderDetails = async (req, res) => {
    try {
        const { orderId, productId } = req.params;

        // Find the order by orderId
        const order = await orderModel.findById(orderId).populate('userId').populate('products.productId').exec();

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Find the specific product in the order
        const product = order.products.find(p => p.productId._id.toString() === productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found in this order' });
        }

        // Prepare the response data
        const data = {
            success: true,
            order: order,
            product: product.productId, // Use product.productId to get the actual product details
            customer: {
                userName: order.userId.name,
                email: order.userId.email
            }
        };

        // Send the JSON response with the order and product details
        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    //User Controller:
    placeOrder,
    orderSuccessfulPage,
    orderDetails,


    //Admin Controller:
    adminOrderDetails,
    changeOrderStatus,
    viewOrderDetails
};

const users = require("../models/users");
const productModel = require("../models/product");
const orderModel = require("../models/order");
const cartModel = require("../models/cart");
const addressModel = require("../models/address");
const walletModel = require("../models/wallet");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const wallet = require("../models/wallet");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const placeOrder = async (req, res) => {
  try {
    const { user_id } = req.session;
    const { addressId, paymentOption, total } = req.body;

    const userCart = await cartModel
      .findOne({ userId: user_id })
      .populate("product.productId")
      .exec();

    if (userCart.product.length > 0) {
      const userAddress = await addressModel.findOne(
        {
          userId: user_id,
          "address._id": addressId,
        },
        {
          "address.$": 1,
        }
      );

      if (userAddress) {
        const address = userAddress.address[0];
        const addressIs = {
          phone: address.phone,
          phone1: address.phone1,
          fullName: address.name,
          state: address.state,
          city: address.city,
          street: address.street,
          pincode: address.pincode,
        };

        const products = userCart.product.map((cartProduct) => ({
          productId: cartProduct.productId._id,
          price: cartProduct.productId.price,
          quantity: cartProduct.quantity,
          orderStatus: "Pending",
        }));

        const orderPlacing = new orderModel({
          userId: user_id,
          products: products,
          paymentMethod: paymentOption,
          paymentStatus:
            paymentOption === "Cash On Delivery" ? "Not Paid" : "Paid",
          shippingAddress: addressIs,
          totalAmount: total,
        });

        const savedData = await orderPlacing.save();

        // Clear the user's cart
        await cartModel.updateOne(
          { userId: user_id },
          { $set: { product: [] } }
        );

        // Handle Wallet payment
        if (paymentOption === "Wallet") {
          const wallet = await walletModel.findOne({ userId: user_id });

          if (wallet && wallet.balance >= total) {
            // Deduct the total from the wallet balance
            wallet.balance -= total;

            // Add a new transaction for the wallet debit
            wallet.transactions.push({
              method: "Debit",
              reason: "Purchase", // Matches your enum
              transactionAmount: total,
              date: Date.now(),
            });

            await wallet.save();
          } else {
            return res
              .status(400)
              .json({ success: false, message: "Insufficient wallet balance" });
          }
        }

        // Manage stock for each product
        for (const product of products) {
          await productModel.findByIdAndUpdate(product.productId, {
            $inc: { quantity: -product.quantity },
          });
        }

        // After stock is managed, send response based on payment method
        if (paymentOption === "Razorpay") {
          const options = {
            amount: total * 100, // amount in smallest currency unit
            currency: "INR",
            receipt: `order_rcptid_${savedData._id}`,
          };

          try {
            const order = await razorpayInstance.orders.create(options);
            res.status(200).json({
              message: "Order placed successfully",
              orderId: order.id,
              _id:savedData._id,
              keyId: process.env.RAZORPAY_KEY_ID,
            });
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error creating Razorpay order" });
          }
        } else if (paymentOption === "Cash On Delivery") {
          res.status(200).json({
            message: "Order placed successfully",
            orderId: savedData._id,
          });
        } else if (paymentOption === "Wallet") {
          res.status(200).json({
            success: true,
            message: "Order placed successfully using wallet!",
            orderId: savedData._id,
          });
        }
      } else {
        res.status(404).json({ message: "Address not found" });
      }
    } else {
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const creatRazorpayInstence=async(req,res)=>{
  try {
    const {id}=req.body;
    if(!id) throw new Error("id not get ");
    const order=await orderModel.findById(id);
    if(!order) throw new Error("order not found id is not valid");

    const options = {
      amount: order.totalAmount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `order_rcptid_${order._id}`,
    };

    try {
      const order = await razorpayInstance.orders.create(options);
      res.status(200).json({
        message: "Order placed successfully",
        orderId: order.id,
        _id:order._id,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating Razorpay order" });
    }
  } catch (error) {
    console.log(error.message);
    
    res.status(400).json({error})
  }
}

const orderSuccessfulPage = async (req, res) => {
  try {
    res.render("user/orderSuccessful");
  } catch (error) {
    console.log(error);
  }
};

const orderDetails = async (req, res) => {
  try {
    // console.log("id the queeeyyyrrrr things:",req.query)
    const { orderId, productId } = req.query;
    const orderDetails = await orderModel.findOne({
      _id: orderId,
      products: {
        $elemMatch: { _id: productId },
      },
    });

    let arrayOfproducts = orderDetails.products;
    let infoOfProduct;
    for (let i = 0; i < arrayOfproducts.length; i++) {
      if (arrayOfproducts[i].id == productId) {
        infoOfProduct = arrayOfproducts[i];
        break;
      }
    }
    // console.log("---+++---+",infoOfProduct)
    //   const aaa = await orderModel.findOne({"products._id":productId })
    // const dataa = await orderModel.findOne({_id:orderId})

    //   const aaa = await orderModel.findOne({products: {$elemMatch: { _id: productId }}})
    //   console.log("herere is hte ordere",orderDetails)
    // console.log("ishte object int he array of products:",aaa)
    res.render("user/orderDetails", { orderDetails, infoOfProduct });
  } catch (error) {
    console.log(error);
  }
};

const adminOrderDetails = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("products.productId")
      .populate("userId")
      .sort({ orderDate: -1 })
      .exec();
    // console.log(orders,' is the orders ')
    res.render("admin/order", { orders });
  } catch (error) {
    console.log(error);
  }
};

const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, productId, status } = req.query;
    // console.log(orderId, productId, status);
    // console.log(typeof orderId, ' is the type of orderId');

    const updateStatus = await orderModel.findOneAndUpdate(
      { _id: orderId, "products.productId": productId },
      { $set: { "products.$.orderStatus": status } },
      { new: true }
    );
    // console.log(updateStatus, ' is the updatedStatus');

    if (updateStatus) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Order or Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const viewOrderDetails = async (req, res) => {
  try {
    const { orderId, productId } = req.params;

    // Find the order by orderId
    const order = await orderModel
      .findById(orderId)
      .populate("userId")
      .populate("products.productId")
      .exec();

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Find the specific product in the order
    const product = order.products.find(
      (p) => p.productId._id.toString() === productId
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in this order" });
    }

    // Prepare the response data
    const data = {
      success: true,
      order: order,
      product: product.productId, // Use product.productId to get the actual product details
      customer: {
        userName: order.userId.name,
        email: order.userId.email,
      },
    };

    // Send the JSON response with the order and product details
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const orderReturned = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    // Find the order by orderId and update the orderStatus for the specific product
    const order = await orderModel.findOneAndUpdate(
      { _id: orderId, "products._id": itemId },
      { $set: { "products.$.orderStatus": "Returned" } },
      { new: true, projection: { products: 1, userId: 1 } } // Return only the products and userId fields
    );

    if (!order) {
      return res.status(404).json({ message: "Order or item not found" });
    }

    // Find the specific product that was returned
    const returnedProduct = order.products.find(
      (item) => item._id.toString() === itemId
    );

    if (!returnedProduct) {
      return res.status(404).json({ message: "Returned product not found" });
    }

    // Update the stock for the returned product
    await productModel.findByIdAndUpdate(returnedProduct.productId, {
      $inc: { quantity: returnedProduct.quantity }, // Increment stock by the returned quantity
    });

    // Fetch the user's wallet to update the balance and transactions
    let wallet = await walletModel.findOne({ userId: order.userId });

    const transactionAmount = returnedProduct.price;

    if (wallet) {
      // If the wallet exists, update the balance and add the new transaction
      wallet.balance += transactionAmount;

      wallet.transactions.push({
        method: "Credit",
        reason: "Refund",
        transactionAmount: transactionAmount,
        date: Date.now(),
      });
    } else {
      // If no wallet exists, create a new one with an initial balance and transaction
      wallet = new walletModel({
        userId: order.userId,
        balance: transactionAmount,
        transactions: [
          {
            method: "Credit",
            reason: "Refund",
            transactionAmount: transactionAmount,
            date: Date.now(),
          },
        ],
      });
    }

    // Save the wallet update
    await wallet.save();
    console.log("Wallet updated:", wallet);

    return res
      .status(200)
      .json({
        message:
          "Order status updated to Returned, stock updated, and wallet credited",
        order,
        wallet,
      });
  } catch (error) {
    console.error("Error in orderReturned:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


const orderCancelled = async(req,res) => {
  try {
    const { orderId, itemId } = req.params;

    // Find the order by orderId and update the orderStatus for the specific product
    const orderedProduct = await orderModel.findOneAndUpdate(
      { _id: orderId, "products._id": itemId },
      { $set: { "products.$.orderStatus": "Cancelled" } },
      { new: true, projection: { products: 1, userId: 1 } } // Return only the products and userId fields
    );

    if (!orderedProduct) {
      return res.status(404).json({ message: "Order or item not found" });
    }

    // Find the specific product that was Cancelled
    const cancelledProduct = orderedProduct.products.find(
      (item) => item._id.toString() === itemId
    );

    if (!cancelledProduct) {
      return res.status(404).json({ message: "Cancelled product not found" });
    }

    // Update the stock for the returned product
    await productModel.findByIdAndUpdate(cancelledProduct.productId, {
      $inc: { quantity: cancelledProduct.quantity }, // Increment stock by the returned quantity
    });
 
    const orders = await orderModel.findOne({_id: orderId}) 
    const paymentStatus = orders.paymentStatus
    if(paymentStatus=='Paid'){
       // Fetch the user's wallet to update the balance and transactions
    let wallet = await walletModel.findOne({ userId: orderedProduct.userId });

    const transactionAmount = cancelledProduct.price;

    if (wallet) {
      // If the wallet exists, update the balance and add the new transaction
      wallet.balance += transactionAmount;

      wallet.transactions.push({
        method: "Credit",
        reason: "Refund",
        transactionAmount: transactionAmount,
        date: Date.now(),
      });
    } else {
      // If no wallet exists, create a new one with an initial balance and transaction
      wallet = new walletModel({
        userId: orderedProduct.userId,
        balance: transactionAmount,
        transactions: [
          {
            method: "Credit",
            reason: "Refund",
            transactionAmount: transactionAmount,
            date: Date.now(),
          },
        ],
      });
    }

    // Save the wallet update
    await wallet.save();
    console.log("Wallet updated:", wallet);
    }

    return res
      .status(200)
      .json({
        message:
          "Order status updated to Cancelled, stock updated, and also updated wallet",
          orderedProduct,
          wallet
      });

  } catch (error) {
    console.error("Error in orderCancelled:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}



const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id && !status) throw new Error("lesss data");
    const order = await orderModel.findById(id);
    if (!order) throw new Error("wrong id , no order fonund");
    order.paymentStatus=status;
    const updatedOrder=await order.save();
    if(!updatedOrder) throw new Error("somthing isssue happend");
    res.status(200).json({order:updatedOrder})
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
    
  }
};



const yearlySalesReport = async (req,res) => {
  try {
      let yearlyReport = await orderModel.aggregate([
          {
              $group: {
                  _id: {
                      year: { $year: '$orderDate' },
                  }, totalIncome: { $sum: '$totalAmount' }
              }
          }
      ])
      // console.log("aggreagate value:::yearlyReport",yearlyReport)
      return res.json({ yearlyReport })
  } catch (error) {
    console.log(error)
    res.status(400).send(error.message)
  }
}


const monthlySalesReport = async (req,res) => {
  try {
    let orderMonth = await orderModel.aggregate([
        {
            $group: {
                _id: { $month: '$orderDate' },
                totalIncome: { $sum: '$totalAmount' }
            }
        },
        {
            $project: {
                _id: 0,
                month: '$_id',
                totalIncome: 1,
                monthName: {
                    $arrayElemAt: [
                        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                        { $subtract: ["$_id", 1] }
                    ]
                }
            }
        }
    ]);

    return res.json({ orderMonth })
} catch (error) {
    console.log(error, 'from report in admin side');
}
}
module.exports = {
 
  //User Controller:
  placeOrder,
  orderSuccessfulPage,
  orderDetails,
  orderReturned,
  orderCancelled,
  creatRazorpayInstence,
  updateOrderPaymentStatus,

  //Admin Controller:
  adminOrderDetails,
  changeOrderStatus,
  viewOrderDetails,
  yearlySalesReport,
  monthlySalesReport
};

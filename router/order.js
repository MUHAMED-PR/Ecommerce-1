const express = require('express')
const app = express()
const orderRoute = express.Router();
const path = require('path')

app.set('views','./views/order')

const auth = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')

const orderController = require('../controllers/orderController')
const userController = require('../controllers/userController')

//UserSide:
orderRoute.post('/placeOrder', auth.isLogin, orderController.placeOrder)
orderRoute.get('/orderSuccessfulPage', auth.isLogin, orderController.orderSuccessfulPage)
orderRoute.get('/orderDetailsPage/:val',auth.isLogin,userController.userProfile)
orderRoute.get('/viewDetails',auth.isLogin,orderController.orderDetails)
orderRoute.patch('/returnOrder/:orderId/:itemId',auth.isLogin,orderController.orderReturned)

//AdminSide:
orderRoute.get('/orderDetails',adminAuth.isLogin,orderController.adminOrderDetails)
orderRoute.post('/changeOrderStatus',adminAuth.isLogin,orderController.changeOrderStatus)
orderRoute.get('/viewOrderDetails/:orderId/:productId',adminAuth.isLogin,orderController.viewOrderDetails)

module.exports = orderRoute
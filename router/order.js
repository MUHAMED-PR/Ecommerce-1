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
orderRoute.get('/orderSuccesfulPage', auth.isLogin, orderController.orderSuccessfulPage)
orderRoute.get('/orderDetailsPage',auth.isLogin,orderController.orderDetails)
orderRoute.get('/ordersListed',auth.isLogin,userController.userProfile)
//AdminSide:
orderRoute.get('/orderDetails',adminAuth.isLogin,orderController.adminOrderDetails)
orderRoute.post('/changeOrderStatus',adminAuth.isLogin,orderController.changeOrderStatus)

module.exports = orderRoute
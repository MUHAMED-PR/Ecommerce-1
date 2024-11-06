const express = require('express')
const userRoute = express.Router()

const auth = require('../middleware/auth')
const userController = require("../controllers/userController");
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const addressController = require('../controllers/addressController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const walletController = require('../controllers/walletController')
const coupon = require('../models/coupon')



const passport = require('passport')
require('../passport')

userRoute.use(passport.initialize());
userRoute.use(passport.session())



//Auth
userRoute.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile']}))

// //Auth Callback
userRoute.get('/auth/google/callback',
    passport.authenticate( 'google',{
       successRedirect: '/success',
       failureRedirect: '/failure' 
    })
);


userRoute.get('/success', userController.successGoogleLogin)

// //failure
userRoute.get('/failure', userController.failureGoogleLogin)

userRoute.get('/', userController.homePage);
userRoute.get('/signIn', auth.isLogout, userController.signIn);
userRoute.get('/signUp', auth.isLogout,userController.signUp);
userRoute.get('/logout', auth.isLogin, userController.logout)
userRoute.get('/OTP', userController.getOtp)
userRoute.post('/signUp', userController.insertUser)
userRoute.post('/home', userController.verifyOTP)
userRoute.get('/resend', userController.resendOTP)
userRoute.post('/userlogin', userController.verifyLogin)

//product
userRoute.get('/productPage', productController.loadProductPage)
userRoute.get('/productDetails/:productId', productController.loadProductDetails)
userRoute.get('/searchProduct', productController.searchProduct)
//FILTER
userRoute.get('/filterProducts',productController.filteredProduct)

//forgot password
userRoute.get('/forgot-password', userController.forgotPassword)
userRoute.post('/forgot-password', userController.resetPassword)
userRoute.get('/otpresetPassword', userController.otpResetPassword)
userRoute.get('/setNewPassword', userController.setNewPassword)
userRoute.post('/ResetPasswordOTPverify', userController.ResetPasswordOTPverify)
userRoute.get('/ResetPasswordREsendOTP', userController.ResetPasswordREsendOTP)
userRoute.post('/changeForgetPassword', userController.changeForgetPassword)


//cart
userRoute.get('/cartPage', auth.isLogin, cartController.loadcart)
userRoute.post('/addToCart', auth.isLogin, cartController.addToCart)
userRoute.get('/removeCart/:productID', auth.isLogin, cartController.removeCart)
userRoute.patch('/ProductQuantity', auth.isLogin, cartController.productQuantity)

//checkout
userRoute.post('/checkoutPage', auth.isLogin, userController.loadCheckout)



//User Profile
userRoute.get('/userProfile', auth.isLogin, userController.userProfile)
//Address
userRoute.post('/addAddress', auth.isLogin, addressController.addingAddress)
userRoute.post('/editAddress',auth.isLogin,addressController.editAddress)
//Change password
userRoute.post('/changePassword', auth.isLogin, userController.changePassword)
//Wallet
userRoute.post('/addCashToWallet/:userId',auth.isLogin,walletController.addCashToWallet)

//Wishlist
userRoute.get('/loadwishlist', auth.isLogin, userController.loadWishlist)
userRoute.get('/addToWishlist/:productID', auth.isLogin, userController.addToWishlist)
userRoute.get('/removeWishlist/:productID', auth.isLogin, userController.removeWishlist)
userRoute.get('/moveToCart/:productID',auth.isLogin,userController.moveToCart)

//coupon
userRoute.get('/availableCoupons',auth.isLogin,couponController.availabeCoupons)
userRoute.get('/applyCoupon/:couponCode',auth.isLogin,couponController.applyCoupon)

module.exports = userRoute;



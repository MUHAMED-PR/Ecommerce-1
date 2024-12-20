// const { tryCatch } = require('engine/utils');
const users = require('../models/users')
const OTP = require('../models/OTP')
const product = require('../models/product')
const addressModel = require('../models/address')
const cartModel = require('../models/cart')
const wishlistModel = require('../models/wishlist')
const orderModel = require('../models/order')
const couponModel = require('../models/coupon')
const walletModel = require('../models/wallet')
const bcrypt = require('bcrypt')
const { tryCatch } = require('engine/utils')
const nodemailer = require('nodemailer')
const flash = require('express-flash')
const { findById } = require('../models/category')
const order = require('../models/order')
require('dotenv').config()



const securePassword = async (password) => {
    try {
        
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

const homePage = async (req, res) => {
    try {
        const productsAvailable = await product.find();
        const top4ProductsByQuantity = productsAvailable
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 4);

            const user = req.session.user_id;
        if (user) {
            // console.log("usersisi:",user)
            const userData = await users.findById(user);
            
            const cartItems = await cartModel.findOne({ userId: userData._id });
            const cartNo = cartItems ? cartItems.product : []; 
            const wishlistItems = await wishlistModel.findOne({userId:userData._id})
            const wishlistNo = wishlistItems ? wishlistItems.products : [];
            
            res.render('user/homePage', { userData, top4ProductsByQuantity, cartNo, wishlistNo});
        } else {
            res.render('user/homePage', { top4ProductsByQuantity, cartNo: [], wishlistNo: [] }); 
        }

    } catch (error) {
        console.log(error);
    }
};



const signIn = (req, res) => {
    try {
        res.render('user/signIn', { message: '' });
    } catch (error) {
        console.log(error);

    }
}
const signUp = async (req, res) => {
    try {
        res.render('user/signUp', { message: '' })
    } catch (error) {
        console.log(error)
    }
}
const otpGenerate = (req, res) => {
    try {
        const digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < 4; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        console.log("OTP is:",OTP)
        return OTP;

    } catch (error) {
        conosle.log(error)
    }

}

const logout = async(req,res)=>{
    try {
        req.session.user_id = null; // Clear email from session
        const wishlistNo = []
        const cartNo = []
        const top4ProductsByQuantity = []

        res.render('user/homePage',{wishlistNo,cartNo,top4ProductsByQuantity})

    } catch (error) {
        console.log(error);
    }
}

const saveOtp = async (email, otp) => {
    try {

        let saveOtp = new OTP({
            email: email,
            otp: otp
        })
        await saveOtp.save();


    } catch (error) {
        console.log(error.message)
    }
}


const getOtp = async (req, res) => {
    try {
        res.render('user/OTP')
    } catch (error) {
        console.error('Error foundednin get otp', error);
    }
}
//registration of a user
const insertUser = async (req, res) => {
    try {
        let message = ''; // Define message outside of any conditional scope

        const regex = new RegExp(req.body.email, 'i');
        const emailExisting = await users.findOne({ email: regex });

        if (emailExisting) {
            message = 'This email is already registered!'; // Update the existing message variable
            return res.render('user/signUp', { message: message });
        }

        const spassword = await securePassword(req.body.password);

        const user = new users({
            userName: req.body.name,
            email: req.body.email,
            password: spassword,
            cpassword: spassword,
            mobile: req.body.mobile
        });

        const userData = await user.save();

        if (userData) {
            const genotp = otpGenerate();
            req.session.email = req.body.email;

            let savingotp = saveOtp(req.body.email, genotp);
            let response = sendVerifyMail(req.body.name, req.body.email, userData._id, genotp);
            return res.render('user/OTP', { message: '' });
        } else {
            message = 'Your registration has failed'; // Update the existing message variable
            return res.render('user/signUp', { message: message });
        }
    } catch (error) {
        console.log(error.message);
    }
};


// //for send mail
const sendVerifyMail = async (name, email, user_id, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.MYEMAILIS,
                pass: process.env.SMTPPASSWORD
            }
        })
        const mailOptions = {
            from: process.env.MYEMAILIS,
            to: email,
            subject: 'for verification mail',
            html: `<P>Enter the OTP <b>${otp}</b> in the app to verify your email and complete the registration.<br>This OTP is expires in 1minutes</br></P>`
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been send :-', info.response);
            }
        })
    
    } catch (error) {
        console.log(error.message);
    }
}
const verifyOTP = async (req, res) => {
    try {

        let storedotp = await OTP.findOne({email:req.session.email})
        const productsAvailable = await product.find();
        const top4ProductsByQuantity = productsAvailable
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 4);

            let wishlistNo = ''
            let cartNo = ''

        if(storedotp.otp==req.body.otp){ 
        
            const updateInfo = await users.updateOne({ email: req.session.email }, { $set: { is_verified: 1 } })
            
            res.render("user/homePage",{message :'', top4ProductsByQuantity, wishlistNo, cartNo})
            
        }else {
            // Render the OTP page with the error message
            res.render("user/OTP",{message:'OTP is not matched'});
        }
    } catch (error) {
        console.log(error.message)
    }
}


//Resend otp
const resendOTP = async (req,res)=>{
    try {
        
        const reOtp = otpGenerate()
        
        const id= await users.findOne({email:req.session.email})
        
        let saveReOtp = saveOtp(req.session.email,reOtp)
        let response = sendVerifyMail(id.name,req.session.email,id._id,reOtp)
        res.redirect('/OTP')

    } catch(error){
        console.log(error);
    }
}


const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const userData = await users.findOne({ email: email })

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                if (userData.is_blocked == false) {
                    if (!userData.is_verified) {
                        const genotp = otpGenerate()
                        req.session.email = req.body.email

                        let savingotp = saveOtp(req.body.email, genotp)
                        let response = sendVerifyMail(req.body.name, req.body.email, userData._id, genotp)
                        res.render('user/OTP', { message: 'please verify your email' })
                    } else {
                        req.session.user_id = userData._id
                        res.redirect('/')
                    }

                } else {
                    res.render('user/signIn', { message: 'Admin is blocked You !..' })
                }
            } else {
                res.render('user/signIn', { message: 'Password is incorrect' })
            }

        } else {
            res.render('user/signIn', { message: 'Email  is incorrect' })
        }
    } catch (error) {
        console.log(error);
    }
}

//Auth for Google with login
const successGoogleLogin = async (req, res) => {
    try {
        const productsAvailable = await product.find()
        const top4ProductsByQuantity = productsAvailable
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 4);

        res.render('user/homePage',{top4ProductsByQuantity})
    } catch (error) {
        console.log(error)
    }
}



const failureGoogleLogin = async (req, res) => {
    console.log('Error');
}






const forgotPassword = async (req, res) => {
    try {
        res.render('user/forgotPass', { message: '' })
    } catch (error) {
        console.log(error)
    }
}

const resetPassword = async (req, res) => {
    try {
        const theEmail = req.body.email
        const emailCheck = await users.findOne({ email: theEmail })
        if (emailCheck) {
            req.session.email = emailCheck.email
            const genotp = otpGenerate()

            let savingotp = saveOtp(emailCheck.email, genotp)
            let response = sendVerifyMail(emailCheck.userName, emailCheck.email, emailCheck._id, genotp)
            req.flash('success', 'An OTP has been sent to your email. Please check your inbox.');

            res.redirect('/otpResetPassword')
        } else {
            req.flash('error', 'No user found with the provided email.');

            res.redirect('/forgot-password')
        }
    } catch (error) {
        console.log(error)
    }
}

const otpResetPassword = async (req, res) => {
    try {
        res.render('user/otpResetPassword')
    } catch (error) {
        console.log(error);
    }
}

const setNewPassword = async (req, res) => {
    try {
        res.render('user/setNewPassword')
    } catch (error) {
        console.log(error);
    }
}
const ResetPasswordOTPverify = async (req, res) => {
    try {
        const storedOTP = await OTP.findOne({ email: req.session.email })

        if (storedOTP.otp === req.body.otp) {
            res.redirect('/setNewPassword')
        } else {
            res.render("user/otpResetPassword", { message: 'OTP is not matched' });
        }


    } catch (error) {
        console.log(error);
    }
}

const ResetPasswordREsendOTP = async (req, res) => {
    try {
        const reOtp = otpGenerate()

        const id = await users.findOne({ email: req.session.email })

        let saveReOtp = saveOtp(req.session.email, reOtp)
        let response = sendVerifyMail(id.name, req.session.email, id._id, reOtp)

        res.redirect('/otpResetPassword')


    } catch (error) {
        console.log(error);
    }
}

const changeForgetPassword = async (req, res) => {
    try {
        const newPassword = req.body.newPassword
        const newCPassword = req.body.confirmPassword
        

        if (newPassword === newCPassword) {
        const hashedPass  =  await bcrypt.hash(newPassword, 10)

        const updatedPass = await users.updateOne({email:req.session.email},{$set:{password:hashedPass}})
           
            req.flash('success', 'Password changed successfully')
            res.redirect('/signIn')
        } else {
            req.flash('error', 'confirm password not matched!...')
            res.redirect('/setNewPassword')
        }
    } catch (error) {
        console.log(error);
    }
}

const userProfile = async(req,res)=>{
    try {
        
        const {user_id} = req.session
        const user = await users.find({_id:user_id})
        const addressDoc = await addressModel.find({userId:user_id})
        const orderDetails = await orderModel.find({userId:user_id}).populate('products.productId').sort({ orderDate: -1 }).exec()
        const walletDetails = await walletModel.find({userId:user_id})
        const orderId = req.query.id;
        if(orderId){

            req.flash('ordersuccess','open')
            return res.redirect('/userProfile');
        }
        const orderMessage = req.flash('ordersuccess')

        if(addressDoc){
            if(orderDetails){
                if(walletDetails){
                    res.render('user/userProfile',{user,addressDoc,orderDetails,orderMessage,walletDetails})
                }else{
                    res.render('user/userProfile',{user,addressDoc,orderDetails,orderMessage,walletDetails:[]})
                }
                
            }else{
                res.render('user/userProfile',{user,addressDoc,orderDetails:[],orderMessage})
            }
        }else{
            res.render('user/userProfile',{user,addressDoc:[],orderDetails:[],orderMessage})
        }
    } catch (error) {
        console.log(error);
    }
}           

const changePassword = async(req,res)=>{
    try {
        const {currentPassword,newPassword,confirmPassword} = req.body
        const userData = await users.findOne({_id:req.session.user_id})
        if(userData){
            const passwordMatch = await bcrypt.compare(currentPassword,userData.password)
            if(passwordMatch){
                if(newPassword==confirmPassword){
                    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
                    const updatePass = await users.findOneAndUpdate({_id:req.session.user_id},{$set:{password:hashedNewPassword}})
                }else{
                    req.flash('error','Confirm password doesnot match! ')
                    res.redirect('/userProfile')
                }
            }else{
                req.flash('error','Current password is wrong')
                res.redirect('/userProfile')

            }
        }
        req.flash('success','Password Updated Successfully')
        res.redirect('/userProfile')
    } catch (error) {
        console.log(error);
    }
}

const loadCheckout = async (req, res) => {
    try {
        const shippingType = req.body.shipping;
        let shippingCost = 0
        
        if (shippingType == 'free') {
            shippingCost = 0;
       } else if (shippingType == 'standard') {
        shippingCost = 40;
       } else if (shippingType == 'express') {
        shippingCost = 70;
       }      

        const cart = await cartModel.findOne({ userId: req.session.user_id }).populate('product.productId').exec();
        const addressDoc = await addressModel.findOne({ userId: req.session.user_id });
        const coupon = await couponModel.find({active:true})

        // Check if the cart is empty
        if (cart && cart.product && cart.product.length > 0) {
            if(addressDoc && addressDoc.address.length > 0){
                res.render('user/checkout', { addressDoc, cart,coupon,shippingCost });
            }else{
                res.send('No address found!')
            }
        } else {
            res.send('No items in your cart.');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred while loading the checkout page.');
    }
};





const loadWishlist = async(req,res)=>{
    try {
        const wishlist = await wishlistModel.findOne({ userId: req.session.user_id }).populate('products.productId').exec()
        res.render('user/wishlist',{wishlist})
    } catch (error) {
        console.log(error)
    }
}

const addToWishlist = async(req,res)=>{
    try {
       
        const { productID } = req.params
        const { user_id } = req.session

        const userWishlist = await wishlistModel.findOne({userId:user_id})
        
        if(userWishlist){
        const wishlistProduct = await wishlistModel.findOne({userId:user_id,'products.productId': productID})

        if(!wishlistProduct){
           const updateWishlist = await wishlistModel.findOneAndUpdate(
            {userId:user_id},
            { $push: { products: { productId: productID } } })
            res.json({added:true})
        }
    }else{
        const newWishlist = new wishlistModel({
            userId:user_id,
            products: [{ productId:productID }]
        });
        await newWishlist.save();
        res.json({added:true})
    }
    } catch (error) {
        console.log(error);
    }
}

const removeWishlist = async(req,res)=>{
    try {
        const { productID } = req.params
        const { user_id } = req.session

        const userWishlist = await wishlistModel.findOne({userId:user_id})
        if(userWishlist){
            const wishlistProduct = await wishlistModel.findOne({userId:user_id,'products.productId': productID})
            if(wishlistProduct){
                const updateWishlist = await wishlistModel.updateOne(
                    {userId:user_id},
                    { $pull: { products: { productId: productID } } })
                    res.json({removed:true})
            }

        }
        } catch (error) {
        console.log(error);
    }
}

const moveToCart = async(req,res)=>{
    try {
        const {productID} = req.params
        const { user_id } = req.session

        const userWishlist = await wishlistModel.findOne({userId:user_id})
        if(userWishlist){
            const wishlistProduct = await wishlistModel.findOne({userId:user_id,'products.productId': productID})
            if(wishlistProduct){
                const productInCart = await cartModel.findOne({userId:user_id,'product.productId':productID})
                if(!productInCart){
                   const addToCart = await cartModel.updateOne({userId:user_id},
                    {$push:{product:{productId:productID}}})
                    res.json({added:true})
                }
                const updateWishlist = await wishlistModel.updateOne(
                    {userId:user_id},
                    { $pull: { products: { productId: productID } } })
                    res.json({removed:true})
                
            }
            }
        }
         catch (error) {
        console.log(error)
    }
}
module.exports = {
    signIn,
    signUp,
    logout,
    insertUser,
    getOtp,
    verifyOTP,
    homePage,
    verifyLogin,
    resendOTP,
    successGoogleLogin,
    failureGoogleLogin,
    forgotPassword,
    resetPassword,
    otpResetPassword,
    setNewPassword,
    ResetPasswordOTPverify,
    ResetPasswordREsendOTP,
    changeForgetPassword,
    userProfile,
    changePassword,
    loadCheckout,
    loadWishlist,
    addToWishlist,
    removeWishlist,
    moveToCart



}
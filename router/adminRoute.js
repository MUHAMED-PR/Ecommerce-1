const express = require('express')
const adminRoute = express.Router();
const path = require('path')
const session = require('express-session')
const adminController = require('../controllers/adminController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const offerController = require('../controllers/offerController')
const app = express()
const adminAuth = require('../middleware/adminAuth')
const multer = require('multer')

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/admin'))
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
})

const upload = multer({storage:storage})


app.set('views', '../views/admin');



adminRoute.get('/',adminController.adminLoad)
adminRoute.get('/login',adminController.adminLogin)
adminRoute.get('/dashboard',adminAuth.isLogin,adminController.dashboard)
adminRoute.get('/customer',adminAuth.isLogin,adminController.costumers)
adminRoute.get('/products',adminAuth.isLogin,adminController.products)
adminRoute.get('/category',adminAuth.isLogin,adminController.category)
adminRoute.post('/login',adminController.adminVerify)
adminRoute.get('/blockUser',adminController.UserBlock)
//category
adminRoute.get('/loadaddCategory',adminController.loadaddCategory)
adminRoute.post('/addCategory',adminController.addCategory)
adminRoute.post('/updateCategory',adminController.updateCategory)
adminRoute.post('/listCategory',adminController.categoryListing)
//product
adminRoute.get('/loadAddProduct',adminController.loadAddProduct)
adminRoute.post('/addProduct', upload.array('images', 4),adminController.addProduct)
adminRoute.get('/editProduct',adminController.loadEditProduct)
adminRoute.post('/editProduct/:id',adminController.updateProduct)
adminRoute.post('/listProduct',adminController.productListing)

// coupon
adminRoute.get('/loadCouponPage',adminAuth.isLogin,couponController.loadAdminCoupon);
adminRoute.get('/addCouponPage',adminAuth.isLogin,couponController.loadAddCoupon);
adminRoute.post('/addingNewCoupon',adminAuth.isLogin,couponController.addCoupon);
adminRoute.delete('/delete/:id',adminAuth.isLogin,couponController.deleteCoupon)
adminRoute.get('/getCoupon/:id', adminAuth.isLogin,couponController.getCouponForEdit);
adminRoute.post('/editCoupon/:id', adminAuth.isLogin,couponController.updateCoupon);

// offers:
adminRoute.get('/loadofferPage',adminAuth.isLogin,offerController.loadOfferPage)
adminRoute.post('/addOffer',adminAuth.isLogin,offerController.addingOffer)
adminRoute.put('/toggleOffer/:id',adminAuth.isLogin,offerController.offerUpdate)

//Sales Report:
adminRoute.get('/Salesreport',adminAuth.isLogin,adminController.SalesReport)




module.exports = adminRoute;
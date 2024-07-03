const express = require('express')
const adminRoute = express.Router();
const path = require('path')
const session = require('express-session')
const adminController = require('../controllers/adminController')
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
adminRoute.get('/loadaddCategory',adminController.loadaddCategory)
adminRoute.post('/addCategory',adminController.addCategory)
adminRoute.post('/updateCategory',adminController.updateCategory)
adminRoute.post('/listCategory',adminController.categoryListing)
adminRoute.get('/loadAddProduct',adminController.loadAddProduct)
adminRoute.post('/addProduct', upload.array('images', 4),adminController.addProduct)
adminRoute.get('/editProduct',adminController.loadEditProduct)
adminRoute.post('/editProduct/:id',adminController.updateProduct)
adminRoute.post('/listProduct',adminController.productListing)






module.exports = adminRoute;
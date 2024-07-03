const product = require('../models/product')


const loadProductPage = async (req, res) => {
    try {
        
        const products = await product.find()

        res.render('user/product', { products })
    } catch (error) {
        console.log(error)
    }
}


const loadProductDetails = async (req, res) => {
    try {

        const productId = req.params.productId
        // console.log(productId, ' productId')
        const productdetails = await product.findOne({ _id: productId })
        // console.log(productdetails+"it is productdetails")
        
        res.render('user/productDtails', { productdetails })
    } catch (error) {
        console.log(error)
    }
}


const searchProduct = async(req,res)=>{
    try {
        

        // console.log(req.query.search,' is the searched things');
        var search = req.query.search
        const regex = new RegExp(search,"i")
        console.log(regex,'is the regesxxxx')
        const products = await product.find({name:regex})
        // console.log(products,' is the product name search');
        res.render('user/product',{products})
    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    loadProductPage,
    loadProductDetails,
    searchProduct
   
    
}
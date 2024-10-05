const cartModel = require('../models/cart')
const productModel = require('../models/product')


const loadcart = async (req, res) => {
    try {
        const cart = await cartModel.findOne({ userId: req.session.user_id }).populate('product.productId').exec();
        
        if (!cart) {
            return res.render('user/cart', { cart: [] });
        }

        res.render('user/cart', { cart: cart.product });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};



//adding product to cart
const addToCart = async (req, res) => {
    try {

        const { user_id } = req.session
        const { productId } = req.body
        // console.log(productId, 'it is produ')

        const existing = await cartModel.find({ userId: user_id })
        if (existing.length == 0) {

            const product = await productModel.findById({_id:productId})
            if(product.quantity>0){
            const addingCart = new cartModel({
                userId: user_id,
                product: [
                    {
                        productId: productId
                    }
                ]
            })

            await addingCart.save()
            res.json({status : 'added'})
        }else{
            res.json({status : 'No quantity available!'})
        }
        
        } else {
            // console.log("it is else")
            const existProduct = await cartModel.find({ $and: [{ 'product.productId': productId }, { userId: user_id }] })
            if (existProduct.length == 0) {
                // console.log('it flsfsdfsd')
                const product = await productModel.findById({_id:productId})
                if(product.quantity>0){
                const addnewpr = await cartModel.updateOne(
                    { userId: user_id },
                    { $addToSet: { 'product': { productId: productId } } }
                );
                res.json({status : 'added'})
            }else{
                res.json({status : 'No quantity available!'})
            }
            } else {

                res.json({ status: 'existing' })
            }
        }

    } catch (error) {
        console.log(error)
    }
}

const removeCart = async (req, res) => {
    try {

        // console.log('productID')
        const { productID } = req.params
        // console.log(productID)
        const { user_id } = req.session
        // console.log(user_id)
        const removing = await cartModel.updateOne(
            { userId:user_id},
            { $pull: { product: { _id: productID } } }
        );

        // console.log(removing)
        res.json({ status: true })


    } catch (error) {
        console.log(error)
    }
}


const productQuantity = async (req, res) => {
    try {
        const { currentQuantity, productId } = req.body
        const { user_id } = req.session

        // console.log(currentQuantity, productId, ' is the quantity')
        const editedQuantity = await cartModel.updateOne(
            { "product._id": productId },
            { $set: { "product.$.quantity": currentQuantity } }
        )
        // console.log(editedQuantity)
        const cartDocument = await cartModel.findOne({ userId: user_id }).populate('userId').populate({
            path: 'product',
            populate: { path: 'productId' }
        })
        res.json({ cartDocument })



    } catch (error) {
        console.log(error)
    }
}





module.exports = {
    loadcart,
    addToCart,
    removeCart,
    productQuantity
}
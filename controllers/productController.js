const product = require('../models/product');


const loadProductPage = async (req, res) => {
    try {
        const sortBy = req.query.sortby || 'alphabetical';
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 8;
        const skip = (page - 1) * itemsPerPage;

        let sortCriteria;
        switch (sortBy) {
            case 'lowToHigh':
                sortCriteria = { price: 1 };
                break;
            case 'highToLow':
                sortCriteria = { price: -1 };
                break;
            case 'alphabetical':
                sortCriteria = { name: 1 };
                break;
            case 'latest':
                sortCriteria = { createdAt: -1 }; 
                break;
            default:
                sortCriteria = { name: 1 };
                break;
        }

        // Fetch the total number of products
        const totalProducts = await product.countDocuments();
        const totalPages = Math.ceil(totalProducts / itemsPerPage);

        const products = await product.find()
            .sort(sortCriteria)
            .populate('category')
            .skip(skip)
            .limit(itemsPerPage);

        res.render('user/product', { products, currentPage: page, totalPages, sortBy });
    } catch (error) {
        console.error('Error loading product page:', error); 
        res.status(500).send('Internal Server Error');
    }
};




const loadProductDetails = async (req, res) => {
    try {
        const productId = req.params.productId;
        const productdetails = await product.findOne({ _id: productId }).populate('category');
        res.render('user/productDetails', { productdetails });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

const searchProduct = async (req, res) => {
    try {
        const search = req.query.search;
        const regex = new RegExp(search, "i");
        const products = await product.find({ name: regex }).populate('category');
        res.render('user/product', { products });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    loadProductPage,
    loadProductDetails,
    searchProduct
};

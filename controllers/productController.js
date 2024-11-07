const userModel = require('../models/users')
const product = require('../models/product');
const offerModel = require('../models/offers')
const categoryModel = require('../models/category')
const cartModel = require('../models/cart')

const loadProductPage = async (req, res) => {
    try {
        const user = req.session.user_id;
        const search = req.query.search || ''
        const sortBy = req.query.sortby || 'alphabetical';
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 4;
        const skip = (page - 1) * itemsPerPage;
        const categories = await categoryModel.find() 
        
        let cartNo = []

        if(user){
            
            const userData = await userModel.findById(user);
            const cartItems = await cartModel.findOne({ userId: userData._id });
             cartNo = cartItems ? cartItems.product : []; 
        }

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

        // Fetch the products
        const products = await product.find()
            .sort(sortCriteria)
            .populate('category')
            .skip(skip)
            .limit(itemsPerPage);

        
        // Render the user product page
        res.render('user/product', { products, currentPage: page, totalPages, sortBy, categories, cartNo});
    } catch (error) {
        console.error('Error loading product page:', error);
        res.status(500).send('Internal Server Error');
    }
};





const loadProductDetails = async (req, res) => {
    try {
        const productId = req.params.productId;
        const user = req.session.user_id;

        // Fetch the product with its category populated
        const productdetails = await product.findOne({ _id: productId }).populate('category');

        let cartNo = []

        if(user){
            
            const userData = await userModel.findById(user);
            const cartItems = await cartModel.findOne({ userId: userData._id });
             cartNo = cartItems ? cartItems.product : []; 
        }


        res.render('user/productDetails', { productdetails, cartNo});
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


const searchProduct = async (req, res) => {
    try {
        const search = req.query.search;
        const sortBy = req.query.sortby || 'alphabetical'; // Get the sortby query parameter, default to 'alphabetical'
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 4;
        const skip = (page - 1) * itemsPerPage;
        const categories = await categoryModel.find()

        let searchCriteria = {};

        // If the search input is not empty, create a regex to filter products by name
        if (search && search.trim() !== "") {
            const regex = new RegExp(search, "i");
            searchCriteria = { name: regex };
        }

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

        // Fetch the total number of matching products for pagination
        const totalProducts = await product.countDocuments(searchCriteria);
        const totalPages = Math.ceil(totalProducts / itemsPerPage);

        // Fetch products based on search criteria, sorting, and pagination
        const products = await product.find(searchCriteria)
            .sort(sortCriteria)
            .populate('category')
            .skip(skip)
            .limit(itemsPerPage);

        // Fetch active offers
        const activeOffers = await offerModel.find({ status: true });

        // Match offers with products
        products.forEach(product => {
            const offer = activeOffers.find(offer => offer.productName.equals(product._id));
            if (offer) {
                product.offer = offer; // Add the offer to the product object
            }
        });

        

        res.render('user/product', { products, currentPage: page, totalPages, sortBy, search, categories });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


const filteredProduct = async (req, res) => {
    const { minPrice, maxPrice, categories } = req.query; // Get query parameters

    try {
        const query = {};

        // Add price filters if provided
        if (minPrice) {
            query.price = { ...query.price, $gte: minPrice };
        }
        if (maxPrice) {
            query.price = { ...query.price, $lte: maxPrice };
        }

        // Add category filters if provided
        if (categories) {
            query.category = { $in: categories.split(',') }; // Convert comma-separated string to array
        }

        // Fetch products based on the filters
        const filteredProducts = await product.find(query);

        // Send back the filtered products
        res.json(filteredProducts);
    } catch (error) {
        console.error('Error filtering products:', error);
        res.status(500).send('Server error');
    }
}


module.exports = {
    loadProductPage,
    loadProductDetails,
    searchProduct,
    filteredProduct
};

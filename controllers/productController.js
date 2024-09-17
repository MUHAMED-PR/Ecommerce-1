const product = require('../models/product');
const offerModel = require('../models/offers')

const loadProductPage = async (req, res) => {
    try {
        const search = req.query.search || ''
        const sortBy = req.query.sortby || 'alphabetical';
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 4;
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

        // Fetch the products
        const products = await product.find()
            .sort(sortCriteria)
            .populate('category')
            .skip(skip)
            .limit(itemsPerPage);

        
        // Render the user product page
        res.render('user/product', { products, currentPage: page, totalPages, sortBy });
    } catch (error) {
        console.error('Error loading product page:', error);
        res.status(500).send('Internal Server Error');
    }
};





const loadProductDetails = async (req, res) => {
    try {
        const productId = req.params.productId;

        // Fetch the product with its category populated
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
        const sortBy = req.query.sortby || 'alphabetical'; // Get the sortby query parameter, default to 'alphabetical'
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 4;
        const skip = (page - 1) * itemsPerPage;

        const regex = new RegExp(search, "i");

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
        const totalProducts = await product.countDocuments({ name: regex });
        const totalPages = Math.ceil(totalProducts / itemsPerPage);

        // Fetch products based on search criteria, sorting, and pagination
        const products = await product.find({ name: regex })
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

        res.render('user/product', { products, currentPage: page, totalPages, sortBy }); // Pass all variables to the template
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

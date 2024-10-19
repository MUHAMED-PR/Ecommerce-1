const users = require('../models/users')
const categoryModel = require('../models/category')
const productModel = require('../models/product')
const orderModel = require('../models/order')
const bcrypt = require('bcrypt')
const flash = require('express-flash')


const adminLoad = async(req,res)=>{
   try {
    // console.log('admin reached.......')
    const userData = await users.find()
    res.render('admin/login',{admin:userData})
   } catch (error) {
    console.log(error)
   } 
}
const adminVerify = async(req,res)=>{
    try {
        // console.log('admin verify...');
        const email = req.body.email
        // console.log(email,'email');
        const password = req.body.password
        // console.log(password,'password');


        const adminData = await users.findOne({email:email, is_admin:1})
        // console.log(adminData,' is adminData');

        if(adminData){
            const matchPassword = await bcrypt.compare(password,adminData.password);

            if(matchPassword){
                req.session.adminId=adminData._id
                res.redirect('/admin/dashboard')
            }else{
                res.render('admin/login', {message:'Incorrect Password'})
            }
        }else{
            res.render('admin/login', {message:'Incorrect Email'})

        }

       
    }
     catch (error) {
        console.log(error)
    }
}


const adminLogin = async(req,res)=>{
    try{
        
        res.render('admin/login')
    }catch(error){
        console.log(error)
    }
}


const dashboard = async(req,res,next)=>{
    try {
        // console.log(req.session,' is the session contents   ')
        res.render('admin/dashboard')
    } catch (error) {
        console.log(error);
    }
}


const costumers = async (req,res)=>{
    try{
        const customers= await users.find()
        // console.log(customers,'customers');
        res.render('admin/customers',{customers});
    }catch(error){
        console.log(error);
    }
}

// handle blocking and unblocking users
const UserBlock = async (req, res) => {
    try {
        // console.log('reached at userblock!!!!!!!!!!!');

        const userId = req.query.id; // Get the user ID from the request
        // console.log(userId,'  userId');
        const user = await users.findById(userId); // Find the user by ID

      
       if(!user.is_blocked){
        await users.findByIdAndUpdate({_id:user._id},{$set:{is_blocked:true}}) 
       }else{
        await users.findByIdAndUpdate({_id:user._id},{$set:{is_blocked:false}})
       }


        return res.status(200).json({ message: "User block status updated successfully", user: user });
    } catch (error) {
        console.error("Error toggling user block status:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const products = async (req,res)=>{
    try{
        let product  = await  productModel.find().populate('category')
      
        res.render('admin/products',{product})
    }catch(error){
        console.log(error)
    }
}

const category = async (req,res)=>{
    try{
        const category = await categoryModel.find() 
        res.render('admin/category',{category})
    }catch(error){
        console.log(error);
    }
}

const loadaddCategory = async(req,res)=>{
    try {
        res.render('admin/addCategory')
        // console.log('reached to addcattegory.....');

    } catch (error) {
        console.log(error);
        // res.render()
    }
}

const addCategory = async(req,res)=>{
    try {
        // console.log('started to adding cattegory.....');
        const {categoryName,description} = req.body
        const regex = new RegExp(categoryName,"i")
        const exstingCategory = await categoryModel.findOne({categoryName:regex})
        if(exstingCategory){
            req.flash('error','Category is already existed!')
            return res.redirect('/admin/loadaddCategory')
        }
        // console.log('existing section overxxx')

        const newCategory =new categoryModel({
            categoryName:categoryName,
            description:description  
        })
        // console.log('newCategory section also passed');

        const savedCategory = await newCategory.save()
        // console.log(savedCategory,'  savedCategory');

        if(savedCategory){
            req.flash('success','Category added.')
            res.redirect('/admin/loadaddCategory')
           
        }else{
            req.flash('error','Category doesnot added')
            res.redirect('/admin/loadaddCategory')

        }

    } catch (error) {
        console.log(error);
        res.render('admin/addCategory',{ message:'505 internal server error!'})
    }
}

const updateCategory = async(req,res)=>{
    try {
        const {categoryId,editName,editDescription}=req.body
        // console.log(editDescription,' is editedDescription');
        // console.log(categoryId,'id',editName,'editName',editDescription,'editedDescription');
        const currentCategory = await categoryModel.findOne({_id:categoryId})
        // console.log(currentCategory.description,' is the description ');
        // console.log(editDescription, 'is the edited description');

        const regex = new RegExp(`^${editName}$`, "i");
        // console.log(regex,'regex');
        const existingCategory = await categoryModel.findOne({categoryName:regex})

        
        if(existingCategory&&currentCategory.description!=editDescription){
            req.flash('success','description successfully changed')
            return res.redirect('/admin/category')
        }else if(existingCategory){
            req.flash('error','Category is already exist!')
           return res.redirect('/admin/category')
            
        }
        // const editCategory = new categoryModel({
        //     categoryName:editName,
        //     description:editDescription
        // })

        const updateDetails = await categoryModel.updateOne({_id:categoryId},{$set:{
            categoryName:editName,
            description:editDescription
        }})
        // console.log(updateCategory,' is the updated data');

        if(updateDetails){
            req.flash('success', 'Category updated successfully.');
            return res.redirect('/admin/category');
        }else{
            req.flash('error', 'Category not updated .');
            return res.redirect('/admin/category');
        }

    } catch (error) {
        console.log(error)
    }
}

const categoryListing = async (req, res) => {
    try {
        const categoryId = req.body.categoryId.trim(); // Trim any whitespace
        // console.log(categoryId,'category category listing');
        // console.log(categoryId, 'is the categoryId');

        // Find the category by its ID
        const category = await categoryModel.findById(categoryId);
        console.log(category,'category');
        // console.log(category, 'category');

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Toggle the is_status field
        const updatedCategory = await categoryModel.findByIdAndUpdate(
            categoryId, 
            { $set: { is_status: !category.is_status } }, 
            { new: true }
        );

        res.status(200).json({ message: 'Category updated', category: updatedCategory });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const loadAddProduct = async(req,res)=>{
    try {
        const category= await categoryModel.find()
        res.render('admin/addProduct',{category})
    } catch (error) {
        console.log(error)
    }
}

const addProduct = async(req,res)=>{
    try {
        
        const {productName,category,
            productPrice,productQuantity,                                
            description} = req.body
        //  console.log(productName,'productName');
            console.log(category,' category');
            // console.log(image1,' is the image1')
            const categoryId = await categoryModel.findOne({categoryName:category})
            console.log(categoryId,'catergoryId over .......!!!!')

            const regex = new RegExp(productName,"i")
            const existingProduct = await productModel.find({name:regex})
            
            if(existingProduct.length>0){
                req.flash('error','Product name is already existed !')
                return res.redirect('/admin/loadAddProduct')
            }
            let images = [];
            if (req.files) {
                images = req.files.map(file => '/admin/' + file.filename);
            } else {
                console.log('No files uploaded');
            }
            const newProduct = new productModel({
                name:productName,
                price:productPrice,
                quantity:productQuantity,
                images: images,
                description,
                category:categoryId._id

            })
          let productss  =  await newProduct.save()
          if(productss){
            const numOfProduct = await categoryModel.findByIdAndUpdate(
                categoryId._id, // Directly passing the category ID
                { $inc: { numOfProduct: 1 } }, // Use the $inc operator to increment numOfProduct by 1
                { new: true } // Optional: Return the updated document
            );
                      }
        
            return res.redirect('/admin/products')
    } catch (error) {
        console.log(error)
    }
}

const loadEditProduct = async(req,res)=>{
    try {
        const {productId} = req.query
        const category = await categoryModel.find({})
        const product = await productModel.findById(productId)
        console.log(product );
        res.render('admin/editProduct',{product,category})
    } catch (error) {
        console.log(error);
    }
}


const updateProduct = async(req,res)=>{
    try {
        const productId=req.params.id
        // console.log(productId, 'prodcut id in update product');
        const {productName,category,productPrice,productQuantity,description}=req.body
        const findCategory=await categoryModel.findOne({categoryName:category})
        // console.log(productName ,'is the productName',category,productPrice,productQuantity,description);
        const existingProduct = await productModel.find({
            name: { $regex: `${productName}`, $options: 'i' },
            _id: { $ne: productId }
        });
        if(existingProduct.length>0){
            console.log('product already existed');
            return res.redirect('/admin/products')

        }
        const updateFields = {
            name: productName,
            category: findCategory._id,
            price: productPrice,
            quantity: productQuantity,
            description: description
        };

        // if (req.files) {
        //     for (let i = 1; i <= 4; i++) {
        //         if (req.files[`image${i}`]) {
        //             updateFields[`image${i}`] = req.files[`image${i}`][0].filename;
        //         }
        //     }
        // }
        const updateProduct = await productModel.findByIdAndUpdate(productId, { $set: updateFields }, { new: true });
        // console.log(updateProduct,'updateProduct');

        req.flash('success','product updated successfully')
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error);
    }
}

const productListing = async(req,res)=>{
    try {
        const productId = req.body.productId.trim()
        // console.log(productId,' is the productId');
        const product = await productModel.findById(productId)
        // console.log(product, ' is the product model shown')

        if(!product){
            return res.status(404).json({ message: 'Category not found' });
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            productId, 
            { $set: { is_status: !product.is_status } }, 
            { new: true }
        );

        res.status(200).json({ message: 'Product  updated', product: updatedProduct });
    } catch (error) {
        console.error('Error updating Product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const SalesReport = async(req,res)=>{
    try {
        const orders = await orderModel
        .find().populate({
          path: 'products.productId',  
          select: 'name'  // Only selects the 'name' field from the Product model
        }) .populate('userId').sort({ orderDate: -1 }); 
 
         const totalSale = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        res.render('admin/salesReport',{orders,totalSale})
    } catch (error) {
        console.log(error)
    }
}


module.exports ={
    adminLoad,
    adminLogin,
    dashboard,
    costumers,
    UserBlock,
    adminVerify,
    products,
    category,
    loadaddCategory,
    addCategory,
    updateCategory,
    categoryListing,
    loadAddProduct,
    addProduct,
    loadEditProduct,
    updateProduct,
    productListing,
    SalesReport
}
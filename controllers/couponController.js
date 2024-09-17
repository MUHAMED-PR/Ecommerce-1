const couponModel = require('../models/coupon');

// Function to check and update expired coupons
const checkCouponExpiry = async () => {
    try {
        const coupons = await couponModel.find();
        const now = new Date();

        for (const coupon of coupons) {
            // Deactivate expired coupons
            if (now > coupon.expiry && coupon.active) {
                coupon.active = false;
                await coupon.save();
            }
            // Reactivate coupons that have become valid again
            else if (now <= coupon.expiry && !coupon.active) {
                coupon.active = true;
                await coupon.save();
            }
        }
    } catch (error) {
        console.error('Error checking coupon expiry:', error);
    }
};


// Function to load the admin coupon page
const loadAdminCoupon = async (req, res) => {
    try {
        await checkCouponExpiry();
        const coupons = await couponModel.find();
        res.render('admin/coupon', { coupons, messages: req.flash() });
    } catch (error) {
        console.error('Error loading admin coupons:', error);
        req.flash('error', 'Failed to load coupons.');
        res.redirect('/admin');
    }
};

// Function to load the add coupon page
const loadAddCoupon = async (req, res) => {
    try {
        res.render('admin/addCoupon');
    } catch (error) {
        console.error('Error loading add coupon page:', error);
        req.flash('error', 'Failed to load add coupon page.');
        res.redirect('/admin');
    }
};

// Function to add a new coupon
const addCoupon = async (req, res) => {
    try {
        const { couponName, couponCode, description, count, expiry, discountAmount,minCartValue } = req.body;

        // Server-side validation
        if (!couponName.trim() || !couponCode.trim() || !count.trim() || !expiry.trim() || !discountAmount.trim()) {
            req.flash('error', 'All fields are required and should not contain only spaces.');
            return res.redirect('/admin/loadCouponPage');
        }

        if(Number(count) < 0 || Number(discountAmount) < 0 ){
            req.flash('error','Count and Discount Amount should not be negative.')
            return res.redirect('/admin/loadCouponPage');
        }

        // Check if the coupon already exists
        const regex = new RegExp(`^${couponCode}$`, 'i');
        const existingCoupon = await couponModel.findOne({ couponCode: regex });

        if (!existingCoupon) {
            const coupon = new couponModel({
                couponName, couponCode, description, count, expiry, discountAmount,minCartValue
            });

            const savedCoupon = await coupon.save();

            if (savedCoupon) {
                req.flash('success', 'Coupon added successfully');
                res.redirect('/admin/loadCouponPage');
            } else {
                req.flash('error', 'Failed to add coupon.');
                res.redirect('/admin/loadCouponPage');
            }
        } else {
            req.flash('error', 'Coupon Code already exists.');
            res.redirect('/admin/loadCouponPage');
        }
    } catch (error) {
        console.error('Error adding coupon:', error);
        req.flash('error', 'Failed to add coupon.');
        res.redirect('/admin/loadCouponPage');
    }
};


// Function to delete a coupon
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await couponModel.findByIdAndDelete(id);

        if (result) {
            res.json({ success: true, message: 'Coupon deleted successfully' });
        } else {
            res.json({ success: false, message: 'Failed to delete coupon' });
        }
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.json({ success: false, message: 'Error occurred' });
    }
};

// Function to get coupon details for editing
const getCouponForEdit = async (req, res) => {
    try {
        const { id } = req.params;
        // console.log('here si the couponId for modal :',typeof id)
        const coupon = await couponModel.findById(id);
        // console.log("editMOdal coupon :",coupon)

        if (coupon) {
            res.json({ success: true, coupon });
        } else {
            res.json({ success: false, message: 'Coupon not found.' });
        }
    } catch (error) {
        console.error('Error fetching coupon details for editing:', error);
        res.json({ success: false, message: 'Error occurred' });
    }
};

// Function to update an existing coupon
const updateCoupon = async (req, res) => {
    try {
        console.log("heelloooo koooiiii")
        const { id } = req.params;
        console.log(typeof id)
        const { couponName, couponCode, description, count, expiry, discountAmount, active } = req.body;

        // Check if the coupon exists
        const coupon = await couponModel.findById(id);

        if (coupon) {
            coupon.couponName = couponName;
            coupon.couponCode = couponCode;
            coupon.description = description;
            coupon.count = count;
            coupon.expiry = expiry;
            coupon.discountAmount = discountAmount;
            coupon.active = active === 'true'; // Convert 'true'/'false' to boolean

            const updatedCoupon = await coupon.save();
            console.log(updateCoupon,"is the updataed coupon")

            if (updatedCoupon) {
                res.json({ success: true, message: 'Coupon updated successfully.' });
            } else {
                res.json({ success: false, message: 'Failed to update coupon.' });
            }
        } else {
            res.json({ success: false, message: 'Coupon not found.' });
        }
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.json({ success: false, message: 'Error occurred' });
    }
};

//userside:
const availabeCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({ active: true });
        res.json(coupons);
    } catch (error) {
        console.error('Error fetching available coupons:', error);
        res.status(500).json({ message: 'Failed to fetch available coupons.' });
    }
}

const applyCoupon = async (req,res)=>{
    try {
        const {couponCode} = req.params
        const coupons = await couponModel.findOne({couponCode})
        // console.log("coupon is :",coupons)
        res.json({coupons})
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    loadAdminCoupon,
    loadAddCoupon,
    addCoupon,
    deleteCoupon,
    getCouponForEdit,
    updateCoupon,
    availabeCoupons,
    applyCoupon
};

const addressModel = require('../models/address')

const addingAddress = async(req,res)=>{
    try {
        const {name,email,phone,phone1,pincode,state,city,street,landmark} = req.body
        const existingAddress = await addressModel.findOne({userId:req.session.user_id})

        if(existingAddress && existingAddress.address.length >=3){
            req.flash('error', 'You can add only three addresses.');
            res.redirect('/userProfile')
        }

        if(existingAddress){
            const update = {
                name,
                email,
                phone,
                phone1,
                pincode,
                state,
                city,
                street,
                landmark
            }
            await addressModel.updateOne({userId:req.session.user_id},{$push:{address:update}})
        }else{
            const newAddress = new addressModel({
                userId: req.session.user_id,
                address: [{
                    name,
                    email,
                    phone,
                    phone1,
                    pincode,
                    state,
                    city,
                    street,
                    landmark
                }]
            });

            await newAddress.save();
        }
        res.redirect('/userProfile')
    } catch (error) {
        console.log(error);
    }
}


const editAddress = async (req, res) => {
    try {
        const { user_id } = req.session;
        console.log("Request body:", req.body);

        const { addressId, name, phone, email, pincode, state, city, street, landmark, alternatePhone } = req.body;

        console.log("Received data:", { user_id, addressId, name, phone, email, pincode, state, city, street, landmark, alternatePhone });

        const editedAddress = {
            name,
            phone,
            email,
            pincode,
            state,
            city,
            street,
            landmark,
            phone1: alternatePhone
        };

        const updatedAddress = await addressModel.findOneAndUpdate(
            { userId: user_id, 'address._id': addressId },
            { $set: { 'address.$': editedAddress } },
            { new: true }
        );

        if (updatedAddress) {
            res.status(200).json({ success: true, message: 'Address updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Address not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};






module.exports ={
    addingAddress,
    editAddress
    
}
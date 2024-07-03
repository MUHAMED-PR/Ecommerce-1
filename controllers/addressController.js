const addressModel = require('../models/address')

const addingAddress = async(req,res)=>{
    try {
        const {name,email,phone,phone1,pincode,state,city,street,landmark} = req.body
        console.log(name,email,phone,phone1,pincode,state,city,street,landmark)
    //    console.log(req.session ,' is the session things')
        const existingAddress = await addressModel.findOne({userId:req.session.user_id})
        // console.log(existingAddress,' is the existing addresssssss')

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

module.exports ={
    addingAddress,
    
}
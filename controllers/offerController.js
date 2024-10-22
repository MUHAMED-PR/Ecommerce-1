const offerModel = require('../models/offers')
const productModel = require('../models/product')

const loadOfferPage = async (req, res) => {
    try {
      const offers = await offerModel.find().populate('productName').exec()
      const products = await productModel.find(); 
      
      res.render('admin/offer', { offers, products });

    } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while loading the offer page.");
    }
  };
  

  const addingOffer = async(req,res)=>{
    try {
        const {offerName,productName,offerPercentage} = req.body

        const saveOffer = new offerModel({
            offerName,productName,
            offerPercentage
        })

        const savedOffer = await saveOffer.save()

        const offerProduct = await productModel.findOne({_id:productName})
        if(offerProduct){
          const offerPrice = offerProduct.price * (1 - offerPercentage / 100);
         const prdt = await productModel.updateOne({_id:productName},{$set:{offerPrice:offerPrice}})
        }else{
          console.log('offered product is not found!')
        }
        res.redirect('/admin/loadofferPage')

    } catch (error) {
        console.log(error)
    }
  }

  const offerUpdate = async (req, res) => {
    try {
        const offerId = req.params.id;

        // Find the offer by ID
        const offer = await offerModel.findById(offerId);

        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        // Toggle the status
        const updatedOffer = await offerModel.findByIdAndUpdate(
            offerId,
            { $set: { status: !offer.status } },
            { new: true } // Return the updated document
        );

        if (updatedOffer) {
            res.status(200).json({ success: true, offer: updatedOffer });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update offer status' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    //adminSide:
    loadOfferPage,
    addingOffer,
    offerUpdate
}
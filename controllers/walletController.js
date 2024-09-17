const walletModel = require('../models/wallet')
const userModel = require('../models/users')



const addCashToWallet = async (req, res) => {
    try {
      const addAmount = parseInt(req.body.amount); // The amount to add
      const userId = req.params.userId;
  
      let wallet = await walletModel.findOne({ userId });
  
      if (wallet) {
        // Update the balance and add the transaction to the transactions array
        wallet.balance += addAmount;
  
        // Add the new transaction
        wallet.transactions.push({
          method: 'Credit',
          reason: 'Cash added to wallet', // Matches your enum
          transactionAmount: addAmount,
          date: Date.now()
        });
  
        const savedData = await wallet.save();
  
        return res.json({ success: true, newBalance: wallet.balance });
      } else {
        // If wallet doesn't exist, create a new wallet with the initial transaction
        wallet = new walletModel({
          userId,
          balance: addAmount,
          transactions: [{
            method: 'Credit',
            reason: 'Cash added to wallet', // Matches your enum
            transactionAmount: addAmount,
            date: Date.now()
          }]
        });
  
        const savedData = await wallet.save();
  
        return res.json({ success: true, newBalance: wallet.balance });
      }
    } catch (error) {
      console.log(error);
      return res.json({ success: false, message: 'An error occurred while adding cash to the wallet.' });
    }
  };
  



module.exports = {
    addCashToWallet
}
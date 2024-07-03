const User = require('../models/users')

 const isLogin = async (req,res,next)=>{
    try {
        if(req.session.user_id){
            next()
        }else{
            res.redirect('/signup')
        }
    } catch (error) {
        console.log(error)
    }
 }


const isLogout = async(req,res,next)=>{
    try {
        if(!req.session.user_id){
            next()
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error)
        res.render('Error-500');

    }
}

const isUserBlocked = async(req,res,next)=>{
    try {
        const user = req.session.user_id
        const blockedUser = await users.findOne({_id:user,is_blocked:true})
        if(blockedUser){
            delete req.session.user_id
            res.redirect('/')
        }else{
            next()
        }
    } catch (error) {
        console.log(error);
        res.render('Error-500')
    }
}
module.exports={
    isLogin,
    isLogout
    // isLogout,
    // isUserBlocked
}
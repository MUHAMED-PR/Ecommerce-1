const isLogin = async(req,res,next)=>{
    try {
        if(req.session.adminId){
            next()
        }else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error)
        res.render('Error-500');
    }
}
const isLogout = async(req,res,next)=>{
    try {
        if(req.session.adminId){
            res.redirect('/admin/dashbaord')
        }else{
            next()
        }

    } catch (error) {
        console.error('Error founded in admin auth',error);
    }
}


module.exports={
    isLogin
}
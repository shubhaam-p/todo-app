const {Router} = require("express");

const adminRouter = Router();

adminRouter.get('/admin', function(req, res){
    res.json('In admin siin')
})

adminRouter.get('/signup', function(req, res){
    res.json('In admin siin')
})
adminRouter.get('/signin', function(req, res){
    res.json('In admin signin')
})



module.exports = {
    adminRouter: adminRouter
};
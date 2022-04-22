const {createUser,login,forgetpassword}=require('./user.controller');
const router=require('express').Router();

const token=require('../validation/tokenvalidation');

router.post('/verify',token);




   



module.exports=router;

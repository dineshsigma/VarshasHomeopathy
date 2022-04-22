const express=require('express');
const router=express.Router();
const Razorpay=require('razorpay');
const crypto=require('crypto');
const shortid=require('shortid');

require('dotenv').config()

var razorpay=new Razorpay({
    key_id:process.env.RAZORPAY_KEY,
    key_secret:process.env.RAZORPAY_SECREAT_KEY
})




router.post('/verification',(req,res)=>{
    const secret='razorpaysecreat';
    const sha=crypto.createHmac('sha256',secret);
    sha.update(JSON.stringify(req.body));
    const digest=sha.digest("hex")

    console.log(digest,req.headers['x-razorpay-signature'])
    console.log(req.headers['x-razorpay-signature'])
    if(digest=== req.headers['x-razorpay-signature']){
        res.status(200).send('signature is verified');
    }
    else{
        res.status(400).send("signature is invalid")
    }

})


router.post('/insert', async (req,res)=>{
    const payment_capture="1";
    const amount=5000;
    const currency="INR"

  options={
        amount,currency,payment_capture,receipt:shortid.generate()
    }
    console.log(options)


try{

console.log(options.amount)
   
    const  response= await razorpay.orders.create(options)
    console.log(response)
   
}
catch(error){
    console.log(error)
    res.status(400).send(error);
}


})



module.exports=router;
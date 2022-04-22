const express=require('express');
const router=express.Router();
const {connection} =require('../db')
var Secreatpayment='wjfhnjwnuoef8urr4r04keifme';
var  stripe=require('stripe')(Secreatpayment)

stripepayment=()=>{
    return new Promise((resolve,reject)=>{
        stripe.customers.create({

        }).then(function(customer){
            var sql=""
            connection.query(sql,[],(error,results)=>{
                if(error){
                    return reject(error);
                }
                else{
                    return resolve(results);
                }
            })

        })
})
}


router.post('/payment',async (req,res)=>{
    console.log("mfjknjnjr")
    try{
        let payment=await stripepayment();
        res.status(200).send(payment);

    }
    catch(error){
        res.status(400).send(error);
    }
})


paymentmethod=(pat_id,amountpaid,date)=>{
    return new Promise((resolve,reject)=>{
        var sql="insert into payments(pat_id,amountpaid,date) values(?,?,?)";
        connection.query(sql,[pat_id,amountpaid,date],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })

}


router.post('/payments',async (req,res)=>{
    try{
        const pat_id=req.body.pat_id
        amountpaid=req.body.amountpaid
        date=req.body.date

        const payment= await paymentmethod(pat_id,amountpaid,date);
        res.status(200).send(payment)

    }
    catch(error){
        res.status(200).send(error)

    }
})


paymenfetch=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from payments";
        connection.query(sql,(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}
router.get('/payments',async (req,res)=>{
    try{
        const getallpayments=paymenfetch();
        res.status(200).send(getallpayments)

    }
    catch(error){
        res.status(200).send(error)
    }
})


paymentfetchone=(pat_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from  payments where pat_id=?";
        connection.query(sql,[pat_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })

    })
}



router.get('/payments:pat_id',async (req,res)=>{
    try{
        let pat_id=req.params.pat_id

        const fetchone=paymentfetchone(pat_id);
        res.status(200).send(fetchone);
    }
    catch(error){
        res.status(400).send(error)
    }
})






amountdate=(pat_id,amountpaid,date)=>{
    return new  Promise((resolve,reject)=>{
        var sql="update payments set amountpaid=?, date=? where pat_id=?";
        connection.query(sql,[amountpaid,date,pat_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }
        })
    })
}





router.put('/payments/:pat_id',async (req,res)=>{
    try{
        let pat_id=req.params.pat_id
        amountpaid=req.body.amountpaid
        date=req.body.date

        const updatepayment= await  amountupdate(pat_id,amounpaid,date);
        res.status(200).send(updatepayment)

    }
    catch(error){
        res.status(400).send(error)

    }

})
module.exports=router;
const  express=require('express');

let router=express.Router()

let {connection}=require('../db')

let {mailer}=require('../transporter')

require('dotenv').config();



contactinsert=(name,email,phonenumber,sendmessage)=>{
    return new Promise((resolve,reject)=>{
        var sql="insert into usercontact(name,email,phonenumber,sendmessage) values(?,?,?,?)"

        connection.query(sql,[name,email,phonenumber,sendmessage],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                let message=sendmessage
                to=email
                var mailOptions={
                   
                    from:email,
                    to:'dinesh.abcdj@gmail.com',
                    subject:'USER  QUERIES',
                    template:'usercontact',
                    context:{
                        message:message+"Please reply below email",
                        to:to
                    }
                }
                mailer.sendMail(mailOptions,function(err,info){
                    if(err){
                        return reject(err)
                    }
                    else{
                       

                    }
                })
                const response={
                    results:results,
                    message:message
                }
                return resolve(response)
            }

        })

    })
}

router.post('/contact',async (req,res)=>{
    try{
        let name=req.body.name
        email=req.body.email
        phonenumber=req.body.phonenumber
        sendmessage=req.body.sendmessage


        let insert= await contactinsert(name,email,phonenumber,sendmessage)
        res.status(200).send(insert)

    }
    catch(error){
        console.log(error)
        res.status(400).send(error)
    }


})
  
contact=()=>{
    return new Promise((resolve,reject)=>{
      
        var sql="select number,email from contact"
        connection.query(sql,(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                var sql="select address,location from address";
                connection.query(sql,(err,res1)=>{
                    let details=[results[0].email,results[0].number]
                    for(var i=0;i<res1.length;i++){
                        details.push(res1[i].address)
                    }
                    return resolve(details)

                })
                
            }
        })
    })
}



router.get('/contact',async (rea,res)=>{
    try{
        let fetchcontact= await contact();
        res.status(200).send(fetchcontact)

    }
    catch(error){
        res.status(200).send(error)
    }
})




module.exports=router;
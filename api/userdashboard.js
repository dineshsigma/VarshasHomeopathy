const express=require('express');
const router=express.Router();
let {connection}=require('../db');
let { mailer } = require('../transporter');

//----------------------------------get appointments by patientid----------------------------------------------//


appointmentsBypat_id=(pat_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select b.book_id,b.pat_id,b.name,b.email,b.cancel,b.phonenumber,b.booking,b.date,b.time,s.name as doctorname from bookapp b, signup s where s.user_id=b.doc_id and b.pat_id=? and b.cancel=0";
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



router.get('/patientappointments',async(req,res)=>{
   
    try{
        if(req.session.USER){
            let pat_id=req.session.USER.user_id
            let patientapp= await appointmentsBypat_id(pat_id);
            res.status(200).send(patientapp)

        }
        else{
            res.status(200).send('not allowed')
        }

    }
    catch(error){
        res.status(400).send(error)

    }
})



///--------------------------------------get doctor reviews by particular patients---------------------------------------------------//
doctorreviews=(pat_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select p.id,p.time,p.patientComments,DATE_FORMAT(date,'%Y-%m-%d') as date,s.name as doctorname from patientreviews p,signup s where pat_id=? and p.doc_id=s.user_id";
        
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

router.get('/doctorreviews',async (req,res)=>{
 
   
    try{

        if(req.session.USER){

            let pat_id=req.session.USER.user_id

            let docrev= await doctorreviews(pat_id);
            res.status(200).send(docrev)

        }
        else{
            res.status(400).send('NOT ALLOWED')
        }
    }
    catch(error){
        res.status(400).send(error)
    }
})



appointmentcancelled=(pat_id,date,time,email,book_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="update  bookapp set cancel=1 where book_id=?";
        connection.query(sql,[book_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
               var sql="select booked from Booking where bookingdate=? and startAt=?";
               connection.query(sql,[date,time],(err,results1)=>{
                   var sql="update Booking set booked=? where bookingdate=? and startAt=?";
                   connection.query(sql,[results1[0].booked-1,date,time],(err,results2)=>{
                       if(err){
                           return reject(err)
                       }
                       else{
                        let booked="YOUR APPOINTMENT IS CANCELLED SUCCESSFULLY"
                        
                        
                        var mailOptions={
                            from:process.env.EMAIL,
                            to:email,
                            subject:' APPOINTMENT CANCELLED',
                            template:'cancel',
                            context:{
                                booked:booked,
                                Id:book_id,
                               
                                Time:time,
                                BookingDate:date,
                                
                               
                            }
                        };
                        mailer.sendMail(
                            mailOptions,function(error,info){
                                if(error){
                                    return reject(error)
                                }
                                else{
                                    
                                   
        
                                }
                            }
                        )
                        var sql="select telephone from signup where user_id=?";
                        connection.query(sql,['1A27mYXL0px1ZNeo7GPUH6FiEc'],(err,results)=>{
                         let to='whatsapp:+91'+results[0].telephone
                        const accountid=process.env.ACCOUNTID
                        const token=process.env.TOKENWHATSAPP
                        const client=require('twilio')(accountid,token)
                        client.messages.create({
                           from: 'whatsapp:+14155238886',
                          body: name+' '+' Appointment Booked  On'+' '+date+' '+'at'+' '+time,
                          to: to
                          
                        })
                        
                        })
                        return resolve(results)

                       }

                   })

               })
            }

        })
    })

}



router.post('/cancelappointments',async (req,res)=>{
   
    try{
        if(req.session.USER){
            let pat_id=req.session.USER.user_id
            date=req.body.date
            time=req.body.time
            email=req.body.email
            book_id=req.body.book_id


            let appcancel= await appointmentcancelled(pat_id,date,time,email,book_id);
            res.status(200).send(appcancel)

        }
        else{
            res.status(400).send('NOT ALLOWED')
        }

    }
    catch(error){
        res.status(400).send(error)
    }

})

todayappointment=(pat_id,date)=>{
    return new Promise((resolve,reject)=>{
       // var sql="select * from bookapp where  date=? and pat_id=?";
       var sql="select b.time,b.name,b.email,s.name as doctorname from bookapp b,signup s where s.user_id=b.doc_id and b.date =? and b.pat_id=?"
        connection.query(sql,[date,pat_id],(err,results)=>{
            if(err){
                return  reject(err)
            }
            else{
                
                return resolve(results)
            }

        })
        

    })
}

router.get('/dashboard',async (req,res)=>{
    if(req.session.USER){
        let pat_id=req.session.USER.user_id

 let date_ob = new Date();
 let date1 = ("0" + date_ob.getDate()).slice(-2);


let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);


let year = date_ob.getFullYear();
 
const date=year + "-" + month + "-" + date1;


        let dashboard= await todayappointment(pat_id,date);
        res.status(200).send(dashboard)

    }
    else{
        res.status(400).send('NOT ALLOWED')
    }
})





forgetpassword=(email,token)=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from signup where email=?";
        connection.query(sql,[email],(err,results)=>{
            if(results.length > 0){
                var mailOptions={
                    from:process.env.EMAIL,
                    to:email,
                    subject:'FORGET PASSWORD',
                    template:'booked',
                    context:{
                        token:token

                        
                       
                    }
                };
                mailer.sendMail(
                    mailOptions,function(error,info){
                        if(error){
                            return reject(error)
                        }
                        else{
                            
                           

                        }
                    }
                )

            }
            else{
                return reject('EMAIL IS NOT REGISTERED')
            }

        })
    })
}

var randtoken = require('rand-token');

router.post('/forgetpassword',async (req,res)=>{
    try{

        let email=req.body.email
        var token = randtoken.generate(20);

        let forget= await forgetpassword(email,token);
        res.status(200).send(forget)
    }
    catch(error){
        res.status(400).send(error)
    }
})


fetchmedicines=(user_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select email from signup where user_id=?";
        connection.query(sql,[user_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                
                //var sql="select * from buymed where email=?";,
                var sql="select b.buy_medid,b.name,b.phonenumber,b.pay_id,b.paymentstatus,b.price,b.time,s.name as doctorname,DATE_FORMAT(date,'%Y-%m-%d') as date from buymed b,signup s where b.doc_id=s.user_id and b.email=? ";
                connection.query(sql,[results[0].email],(err,results1)=>{
                    if(err){
                        return reject(err)
                    }
                    else{
                       
                        return resolve(results1)
                    }
                })
            }

        })
    })

}


router.get('/buymedicines',async (req,res)=>{
    try{
        if(req.session.USER){
            let user_id=req.session.USER.user_id

            let getmedicines= await fetchmedicines(user_id);
            res.status(200).send(getmedicines)

        }

    }
    catch(error){
        res.status(400).send(error)
    }
})
module.exports=router;
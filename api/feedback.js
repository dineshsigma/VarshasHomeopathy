const express=require('express');
let router=express.Router();
let {connection}=require('../db.js')
let {randomnumbers}=require('../randomgenerator/randomnumber')

getallfeedbacks=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from userfeedback";
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

router.get('/feedback',async (req,res)=>{
    try{
        const getfeedback= await getallfeedbacks();
        res.status(200).send(getfeedback)

    }
    catch(error){
        res.status(400).send(error)
    }

})



fetchbyidfeedback=(book_id)=>{
    return new Promise((resolve,reject)=>{
      
        var sql="select * from userfeedback where book_id=?";
        connection.query(sql,[book_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })

    })
    
}

router.get('/feedback/:id',async (req,res)=>{
    try{
        let book_id=req.params.id


        const fetchbook=await fetchbyidfeedback(book_id);
        res.status(200).send(fetchbook)

    }
    catch(error){
        res.status(400).send(error)
    }
})


feedbackpost=(id,book_id,feedback,date)=>{
    return new Promise((resolve,reject)=>{
        var sql="insert into userfeedback(id,book_id,feedback,date) values(?,?,?,?)";
        connection.query(sql,[id,book_id,feedback,date],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }
        })
    })

}

router.post('/feedback',async (req,res)=>{
    try{
        const id=randomnumbers(10)
        book_id=req.body.book_id
        feedback=req.body.feedback
        let today = new Date()
const date=today.toISOString().split('T')[0]


const feedbackins=await feedbackpost(id,book_id,feedback,date);
res.status(200).send(feedbackins)

        

    }
    catch(error){
        console.log(error)
        res.status(400).send(error)

    }

})



feedupdate=(id,feedback,date)=>{
    return new Promise((resolve,reject)=>{
        var sql="update userfeedback set feedback=?,date=? where id=?";
        connection.query(sql,[feedback,date,id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })

}



router.put('/feedback/:id',async (req,res)=>{
    try{
        const id=req.params.id
        feedback=req.body.feedback
        let today = new Date()
const date=today.toISOString().split('T')[0]

const updatefeedback= await feedupdate(id,feedback,date);
res.status(200).send(updatefeedback)
        

    }
    catch(error){
        res.status(400).send(error)
    }
})





//-------------------------------------------review table----------------------------------------------------//


reviewall=()=>{
    return new  Promise((resolve,reject)=>{
        var sql="select * from review";
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


router.get('/review',async (req,res)=>{
    try{
        const fetchreview = await reviewall();
        res.status(200).send(fetchreview)

    }
    catch(error){

    }
})

postreviews=(id,doctor_id,user_id,review,date,time,patientvisible)=>{
    return new Promise((resolve,reject)=>{
        var sql="insert into review(id,doctor_id,user_id,review,date,time,patientvisible) values(?,?,?,?,?,?,?)";
        connection.query(sql,[id,doctor_id,user_id,review,date,time,patientvisible],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}

router.post('/review',async (req,res)=>{
    try{
        let id=randomnumbers(10)

let review=req.body.review

let today = new Date()
const date=today.toISOString().split('T')[0]
   
var time = new Date();

 const currenttime= time.toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true })


let patientvisible=req.body.patientvisible
let doctor_id=req.body.doctor_id
let user_id=req.body.user_id



        const insertreview = await  postreviews(id,doctor_id,user_id,review,date,currenttime,patientvisible);
        res.status(200).send(insertreview)

    }
    catch(error){
        console.log(error)
        res.status(400).send(error)

    }
})


reviewFetch=(doctor_id,user_id)=>{
    return  new Promise((resolve,reject)=>{
        var sql="select time,review,patientvisible,DATE_FORMAT(date, '%Y-%m-%d') as date from review";
        connection.query(sql,[doctor_id,user_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}

router.get('/review/:doc_id/:user_id',async (req,res)=>{
    try{
        let doctor_id=req.params.doctor_id
        user_id=req.params.user_id


        const getreview= await reviewFetch(doctor_id,user_id);
        res.status(200).send(getreview)

    }
    catch(error){
        res.status(400).send(error)
    }
})
module.exports=router
const express=require('express');
const router=express.Router();
const {connection}=require('../db.js')
let {randomnumbers}=require('../randomgenerator/randomnumber')
let multer=require('multer')
let fs=require('fs');
require('dotenv').config();
let { mailer } = require('../transporter');
const {
    genSaltSync,
    hashSync,
    compareSync,
  } = require('bcrypt');

patientfetchreviews=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select p.id, p.pat_id,p.doc_id,p.date,p.time,p.reviews,p.showuser,m.medicines,p.reports from patientreviews p,patientmedicines m where p.patmed_id=m.id";
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


router.get('/patientreviews',async (req,res)=>{
   try{

    const getreviews= await patientfetchreviews();
    res.status(200).send(getreviews);

   }
   catch(error){
       res.status(400).send(error)
   }
})






patientfetchreviews=(id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select p.doc_id,p.date,p.time,p.reviews,p.showuser,m.medicines,p.reports from patientreviews p,patientmedicines m where p.patmed_id=m.id and p.pat_id=?";
        connection.query(sql,[id],(err,results)=>{
           if(err){
               return reject(err)
        
           }
           else{
               return resolve(results)
           }
        })
    })
}


router.get('/patientbyreviews/:id',async (req,res)=>{
   try{
       let id=req.params.id

    const getreviews= await patientfetchreviews(id);
    res.status(200).send(getreviews);

   }
   catch(error){
       res.status(400).send(error)
   }
})


const FOLDER = './public/chambarimages';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FOLDER);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname
      .toLowerCase()
      .split(' ')
      .join('-');
    cb(null, fileName);
  },
});

// Multer Mime Type Validation
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error(
          'Only .png, .jpg and .jpeg format allowed!'
        )
      );
    }
  },
});


reviewspost=(id,pat_id,doc_id,reviews,patmed_id,date,currenttime,showuser,reportfile)=>{
    return  new Promise((resolve,reject)=>{
        var sql="insert into patientreviews(id,pat_id,doc_id,reviews,patmed_id,date,time,showuser,reports) values(?,?,?,?,?,?,?,?,?)";
        connection.query(sql,[id,pat_id,doc_id,reviews,patmed_id,date,currenttime,showuser,reportfile],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }
        })
    })

}

router.post('/patientreviews',upload.array('report',20),async (req,res)=>{
    try{
        if(req.session.DOC){
            if(req.files!=null){
        let id=randomnumbers(10)
        pat_id=req.body.pat_id
        doc_id=req.session.doc_id
        reviews=req.body.reviews
        patmed_id=req.body.pat_med
        let today = new Date()
        const date=today.toISOString().split('T')[0]
        var time = new Date();
        const currenttime= time.toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true })
        showuser=req.body.showuser
        report=req.files
         array=[]

        for(var i=0;i<req.files.length;i++){
            array.push(req.files[i].filename)

        }
        
        let jsonfile=JSON.stringify(array)

 
let reportfile=jsonfile.replace(/['"]+/g, '')
   

const insertreviews=await reviewspost(id,pat_id,doc_id,reviews,patmed_id,date,currenttime,showuser,reportfile);
res.status(200).send(insertreviews)

            }
            else{

                res.status(400).send('IMAGE  FIELD IS REQUIRED')
            }

        }
        else{
            res.status(400).send('NOT ALLOWED')
        }


    }
    catch(error){
        res.status(400).send(error)
    }
})


updatepatientreviewwithimage=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select report  from patientreviews where id=?";
        connection.query(sql,[id],(err,results)=>{
         console.log(results)

        })
    })
}


router.put('/patientreview/:id',upload.single('report ',20),async (req,res)=>{
    try{

        if(req.session.DOC){
            if(req.files!=null){
                let id=req.params.id
                pat_id=req.body.pat_id
                doc_id=req.session.DOC.user_id
                showuser=req.body.showuser
                reviews=req.body.reviews
                patmed_id=req.body.pat_med
                let today = new Date()
                const date=today.toISOString().split('T')[0]
                var time = new Date();
                const currenttime= time.toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true })
                array=[]
                for(var i=0;i<req.files.length;i++){
                    array.push(req.files[i].filename)

                }
                let jsonfile=JSON.stringify(array)

 
                let reportfile=jsonfile.replace(/['"]+/g, '')





                let updatereview= await updatepatientreviewwithimage(id,pat_id,doc_id,showuser,reviews,patmed_id,date,currenttime,reportfile,array);
                res.status(200).send(updatereview)


            }
            else{
                let id=req.params.id
                pat_id=req.body.pat_id
                doc_id=req.session.DOC.user_id
                showuser=req.body.showuser
                reviews=req.body.reviews
                patmed_id=req.body.pat_med
                let today = new Date()
                const date=today.toISOString().split('T')[0]
                var time = new Date();
                const currenttime= time.toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true })

                let updaterev=await updatepatientreviewwithoutimg(id,pat_id,doc_id,showuser,reviews,patmed_id,date,currenttime);
                res.status(200).send(updaterev)

            }


        }
        else{
            res.status(400).send('  NOT ALLOWED')
        }


    }
    catch(error){
        res.status(400).send(error)
    }
})

updatepatientreviewwithoutimg=(id,pat_id,doc_id,showuser,reviews,patmed_id,date,currenttime)=>{
    return new Promise((resolve,reject)=>{
        var sql="update patientreviews set pat_id=?,doc_id=?,showuser=?,reviews=?,patmed_id=?,date=?,currenttime=? where id=?";
        connection.query(sql,[pat_id,doc_id,showuser,reviews,patmed_id,date,currenttime,id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }
        })
    })

}


emailSend=(hashpassword,userpassword,pat_id)=>{
    return new Promise((resolve,reject)=>{
       
       
var sql="select email,phonenumber,name from patient where pat_id=?";
connection.query(sql,[pat_id],(err,results)=>{
    if(err){
        return reject(err)
    }
    else{
        
       let  docname='varsha'
       email=results[0].email
       link='drvarshashomeopathy.com'
    
        var mailOptions={
            from:process.env.EMAIL,
            to:results[0].email,
            subject:'DOCTOR ADD PATIENTS',
            template:'staff',
            context:{
                
                
                email:email,
                link:link,
                password:userpassword
               
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
     var sql="select * from signup where user_id=?";
     connection.query(sql,[pat_id],(err,results1)=>{
         if(results1.length >0){
            
             var sql="update signup set password=? where user_id=?";
             connection.query(sql,[hashpassword,pat_id],(err,results)=>{
                 if(err){
                     return reject(err)
                 }
                 else{
                     return resolve(results)
                 }
             })

         }
         else{
             console.log(pat_id);
             console.log(userpassword)
             
             var sql="insert into signup(user_id,name,email,telephone,password,accessLevel) values(?,?,?,?,?,?)";
             connection.query(sql,[pat_id,results[0].name,results[0].email,results[0].phonenumber,hashpassword,0],(err,results2)=>{
                 if(err){
                     return reject(err)
                 }
                 else{
                     return resolve(results2)
                 }

             })
         }
     })
       

    }

})


    })
}

router.post('/sendemail',async (req,res)=>{
   
    try{

        let userpassword=randomnumbers(10)
        pat_id=req.body.pat_id
        pepperpassword=userpassword+process.env.PEPPER
        
        hashpassword=hashSync(pepperpassword,10);
        


        
const sendpass=await  emailSend(hashpassword,userpassword,pat_id);
res.status(200).send(sendpass)

    }
    catch(error){
        console.log(error)
        res.status(400).send(error)
    }
})




Doctoraddpatients=(id,name,email,phonenumber)=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from patient where phonenumber=?";
        connection.query(sql,[phonenumber],(err,results)=>{
            if(results.length > 0){
                return  reject ('PATIENT IS ALREADY EXITS')
            }
            else{

        var sql="insert into patient(pat_id,name,email,phonenumber,doctoradd) values(?,?,?,?,?)";
        connection.query(sql,[id,name,email,phonenumber,1],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
               const response={
                   pat_id:id,
                   result:results
               }
               return resolve(response)
            }

        })

            }

        })

    })
}






router.post('/addpatients',async (req,res)=>{
   
    try{
        let id=randomnumbers(10);
        name=req.body.name
        email=req.body.email
        phonenumber=req.body.phonenumber


        let docadd=await Doctoraddpatients(id,name,email,phonenumber);
        res.status(200).send(docadd)

    }
    catch(error){
        res.status(400).send(error)
    }
})


module.exports=router;
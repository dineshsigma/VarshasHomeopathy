let express=require('express');
let router=express.Router();
let {connection}=required('../db')
let {randomnumbers}=require('../randomgenerator/randomnumber')

let multer=require('multer')

const FOLDER = './public/doctorimages';

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



createProfile=(doc_id,doctorname,aboutdoctor,docimg,email,phonenumber)=>{
    return new Promise((resolve,reject)=>{
        var sql="insert into DocProfile(doc_id,doctorname,aboutdoctor,docimg,email,phonenumber) values(?,?,?,?,?,?)";
        connection.query(sql,[doc_id,doctorname,aboutdoctor,docimg,email,phonenumber],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}


router.post('/doctorprofile',upload.single('docimg'),async (req,res)=>{
    try{
        if(req.file!=null){
            let doc_id=randomnumbers(10)
            doctorname=req.body.doctorname
            aboutdoctor=req.body.aboutdocotor
            docimg=req.file.filename
            email=req.body.email
            phonenumber=req.body.phonenumber


            const docprof=await createProfile(doc_id,doctorname,aboutdoctor,docimg,email,phonenumber);
            res.status(200).send(docprof)

        }
        else{
            res.status(400).send('DOCTOR IMAGE IS REQUIRED')
        }

    }
    catch(error){
        res.status(400).send(error)
    }
})

profilewithImage=(doc_id,doctorname,aboutdoctor,docimg,email,phonenumber)=>{
    return new Promise((resolve,reject)=>{
        var sql="select docimg from DocProfile where doc_id=?";
        connection.query(sql,[doc_id],(err,results)=>{
            fs.writeFile(
                './public/doctorimages/' +
                results[0].docimg,
                './public/doctorimages/' + docimg,
                error => {
                  if (error) throw error;
                }
              );
              fs.unlink(
                './public/doctorimages/' +
                results[0].docimg,
                error => {
                  if (error) throw error;
                }
              );

              var sql="update DocProfile set doctorname=?,aboutdoctor=?,docimg=?,email=?,phonenumber=? where doc_id=?";
              connection.query(sql,[doctorname,aboutdoctor,docimg,email,phonenumber],(err,results1)=>{
                  if(err){
                      return reject(err)
                  }
                  else{
                      return resolve(results1)
                  }

              })


        })

    })
}





profilewithoutImage=(doc_id,doctorname,aboutdoctor,email,phonenumber)=>{
    return new Promise((resolve,reject)=>{
        var sql="update DocProfile set doctorname=?,aboutdoctor=?,email=?,phonenumber=? where doc_id=?";
        connection.query(sql,[doctorname,aboutdoctor,email,phonenumber,doc_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })

    })
}
router.put('/doctorprofile/:id',upload.single('docimg'),async (req,res)=>{
    try{
        if(req.file!=null){
            doc_id=req.params.doc_id
            doctorname=req.body.doctorname
            aboutdoctor=req.body.aboutdocotor
            docimg=req.file.filename
            email=req.body.email
            phonenumber=req.body.phonenumber


            const updatewithprofile=await profilewithImage(doc_id,doctorname,aboutdoctor,docimg,email,phonenumber);
            res.status(200).send(updatewithprofile)
        }

        else{
            doc_id=req.params.doc_id
            doctorname=req.body.doctorname
            aboutdoctor=req.body.aboutdocotor
           
            email=req.body.email
            phonenumber=req.body.phonenumber



            const updatewithoutprofile=await profilewithoutImage(doc_id,doctorname,aboutdoctor,docimg,email,phonenumber);
            res.status(200).send(updatewithoutprofile)
        }



    }
    catch(error){
        res.status(400).send(error)
    }
})

profilebyid=(doc_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from DocProfile where doc_id=?";
        connection.query(sql,[doc_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}
router.get('/doctorprofile/:id',async (req,res)=>{
    try{
         let doc_id=req.params.id

         const getbyid=await profilebyid(doc_id);
         res.status(200).send(getbyid)

    }
    catch(error){
        res.status(400).send(error)
    }
})





getprofile=()=>{
    return new Promise((resolve,reject=>{
        var sql="select * from DocProfile";
        connection.query(sql,(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    }))
}





router.get('/doctorprofile',async (req,res)=>{
    try{
        const get=await getprofile();
        res.status(200).send(get)

    }
    catch(error){
        res.status(400).send(error)
    }

})
module.exports=router;

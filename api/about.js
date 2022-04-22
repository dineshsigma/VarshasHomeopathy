

const express=require('express')
const router=express.Router()
const{connection}=require('../db')
const multer=require('multer')
let fs=require('fs')
let {randomnumbers}=require('../randomgenerator/randomnumber')


//---------------------------------------------ABOUT DOCTOR update-----------------------------------//





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
      
    }
  },
});



aboutdocwithimg=(id,image,doctorname,description,links,stringobj,qualificationexp)=>{
  return new Promise((resolve,reject)=>{
    var sql="select image from AboutDoctor where id=?";
    connection.query(sql,[id],(err,results)=>{
      if(err){
        return reject(err)
      }
      else{
        fs.writeFile(
          './public/chambarimages/' +
          results[0].image,
          './public/chambarimages/' + image,
          error => {
            if (error) throw error;
          }
        );
        fs.unlink(
          './public/chambarimages/' +
          results[0].image,
          error => {
            if (error) throw error;
          }
        );
      
        var sql="update AboutDoctor set image=?,doctorname=?,description=?,links=?,qualification=?,experience=? where id=?";
        connection.query(sql,[image,doctorname,description,stringobj,qualification,experience,id],(err,results1)=>{
          if(err){
            return reject(err)
          }
          else{
            return resolve(results1);
          }
        })

      }
    })

  })

}

aboutdocwithoutimg=(id,doctorname,description,links,stringobj,qualification,experience)=>{
  return new Promise((resolve,reject)=>{
    var sql="update AboutDoctor set doctorname=?,description=?,links=?,qualification=? ,experience=?  where id=?";
    connection.query(sql,[doctorname,description,stringobj,qualification,expreience,id],(err,results)=>{
      if(err){
        return reject(err)
      }
      else{
        return resolve(results);
      }

    })

  })
}
router.put('/aboutdoctor/:id',upload.single('doctorimg'), async (req,res)=>{
 
  try{
    if(req.file!=null){
      let id=req.params.id
      image=req.file.filename
      doctorname=req.body.doctorname
      description=req.body.description
      links=req.body.links
      qualification=req.body.qualification
      experience=req.body.experience

      let stringobj=JSON.stringify(links)

      const updateabout=aboutdocwithimg(id,image,doctorname,description,links,stringobj,qualification,experience);
      res.status(200).send(updateabout)


    }
    else{
      let id=req.params.id
      
      doctorname=req.body.doctorname
      description=req.body.description
      links=req.body.links

      let stringobj=JSON.stringify(links)
      qualification=req.body.qualification
      experience=req.body.experience

      const updateaboutdoc=aboutdocwithoutimg(id,doctorname,description,links,stringobj,qualification,experience);
      res.status(200).send(updateaboutdoc)



    }
   
  }
  catch(error){
    res.status(400).send(error)

  }
})

//-------------------------------------------fetchAbout doctor------------------------//

aboutdoctorfetch=()=>{
  return new Promise((resolve,reject)=>{
    var sql="select * from AboutDoctor ";
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

router.get('/aboutdoctor',async (req,res)=>{
  try{
   
     

    const fetch=await aboutdoctorfetch();
    res.status(200).send(fetch);
   

  }
  catch(error){
    console.log(error)
    res.status(400).send(error)

  }

})



//----------------------------------UPDATE HOMEOPATHY----------------------------------//

homewithimg=(id,image,descrition)=>{
  return new Promise((resolve,reject)=>{
    var sql="select image from Homeopathy where id=?";
    connection.query(sql,[id],(err,results)=>{
      if(err){
        return reject(err)
      }
      else{
        fs.writeFile(
          './public/chambarimages/' +
          results[0].image,
          './public/chambarimages/' + image,
          error => {
            if (error) throw error;
          }
        );
        fs.unlink(
          './public/chambarimages/' +
          results[0].image,
          error => {
            if (error) throw error;
          }
        );

        var sql="update Homeopathy set image=?,description=? where id=?";
        connection.query(sql,[image,descrition,id],(err,results1)=>{
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

router.put('/abouthomeopathy/:id',upload.single('homeoimg'),async (req,res)=>{
 
 
  try{
    if(req.file!=null){
      let id=req.params.id
      image=req.file.filename
      description=req.body.description

      const updatehome=await homewithimg(id,image,description);
      res.status(200).send(updatehome)
    

    }
    else{
      let id=req.params.id
      description=req.body.description

      const uphom=await homeowithoutimg(id,description);
      res.status(200).send(uphom);

    }

  }
  catch(error){
    console.log(error)
    res.status(400).send(error)
  }
})

homeowithoutimg=(id,description)=>{
  return new Promise((resolve,reject)=>{
    var sql="update Homeopathy set description=? where id=?";
    connection.query(sql,[description,id],(err,results)=>{
      if(err){
        return reject(err)
      }
      else{
        return resolve(results)
      }
    })
  })

}


//-------------------------------------fetch HOMEOPATHY-----------------------------------//

fetchHomeopathy=()=>{
  return  new Promise((resolve,reject)=>{
    var sql="select * from Homeopathy ";
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


router.get('/abouthomeopathy', async (req,res)=>{
  try{
    const fetchhome= await fetchHomeopathy();
    res.status(200).send(fetchhome)

  }
  catch(error){
    res.status(400).send(error);
  }
})



doctorDetails=(id,doc_id,image,file)=>{
  return new Promise((resolve,reject)=>{
    var sql="select * from AboutDoctor where doc_id=?";
    connection.query(sql,[doc_id],(err,results)=>{
      if(err){
        return reject(err)
      }
      if(results.length==0){
        
        var sql="insert into AboutDoctor(id,image,doc_id) values(?,?,?,?)";
        connection.query(sql,[id,image,doc_id],(err,results1)=>{
          if(error){
            return reject(err)
          }
          else{
            const response={
              imagename:image,
              results1:results1
            }
            return resolve(response)
          }
        })
      }
      else{
        if(file!=null){
          var sql="select image from AboutDoctor where doc_id=?";
          connection.query(sql,[doc_id],(err,results2)=>{
            fs.writeFile(
              './public/chambarimages/' +
              results2[0].image,
              './public/chambarimages/' + image,
              error => {
                if (error) throw error;
              }
            );
            fs.unlink(
              './public/chambarimages/' +
              results2[0].image,
              error => {
                if (error) throw error;
              }
            );
            var sql="update AboutDoctor set image=? where doc_id=?";
            connection.query(sql,[image,doc_id],(err,results3)=>{
              if (err) return reject (err)
              else {
                let response={
                  imagename:image,
                  results3:results3
                }
                return resolve(response)
              }
            })

          })
          

        }
        else{
          res.status(400).send('IMAGE FILED IS REQUIRED')
        }
       
       
       
      }
    })
  })

}

router.post('/aboutdocimg',upload.single('doctorimage'),async (req,res)=>{
 
 
  try{
    if(req.session.DOC){
     if(req.file!=null){

      let id=randomnumbers(10)
      doc_id=req.session.DOC.user_id
      image=req.file.filename
     
      
      
     
      file=req.file


      const aboutinsup=await doctorDetails(id,doc_id,image,file);
      res.status(200).send(aboutinsup)

     }
     else{
       res.status(400).send('image filed is required')
     }

      

    }
    else{
      res.status(400).send('NOT ALLOWED')
    }

  }
  catch(error){
    console.log(error)
    res.status(400).send(error)
  }
})

doctorinformationupdate=(id,name,qualification,experience,doc_id,email,phonenumber)=>{
  return new Promise((resolve,reject)=>{
    var sql="select * from AboutDoctor where doc_id=?";
    connection.query(sql,[doc_id],(err,results)=>{
      if(results.length ==0){
        var sql="insert into AboutDoctor(id,doctorname,qualification,experience,doc_id,email,phonenumber) values(?,?,?,?,?,?,?)";
        connection.query(sql,[id,doctorname,experience,qualification,doc_id,email,phonenumber],(err,insresults)=>{
          if(err){
            return reject(err)
          }
          else{
            return resolve(insresults)
          }

        })

      }
      else{
        var sql="update AboutDoctor set doctorname=?,experience=?,qualification=? ,email=?,phonenumber=? where doc_id=?";
        connection.query(sql,[name,experience,qualification,email,phonenumber,doc_id],(err,results)=>{
          if(err){
            return reject(err)
          }
          else{
            var sql="update signup set email=?,name=?,telephone=? where user_id=?";
            connection.query(sql,[email,name,phonenumber,doc_id],(err,result)=>{
              if(err){
                return reject(err)
              }
              else{
                return resolve(result)
              }

            })
          }
    
        })

      }

    })
   
  })
}

router.post('/aboutinformation',async (req,res)=>{
  

  try{
    if(req.session.DOC){
      let doc_id=req.session.DOC.user_id
      name=req.body.name
      qualification=req.body.qualification.toUpperCase()
      experience=req.body.experience
      id=randomnumbers(10)
      email=req.body.email
      phonenumber=req.body.phonenumber

      const updateinf=await doctorinformationupdate(id,name,qualification,experience,doc_id,email,phonenumber);
      res.status(200).send(updateinf)


    }
    else{
      res.status(400).send('NOT ALLOWED')
    }

  }
  catch(error){
    res.status(400).send(error)
  }
 
})
onlyupdateabout=(id,about,doc_id)=>{
  return new Promise((resolve,reject)=>{
    var sql="select * from AboutDoctor where doc_id=?";
    connection.query(sql,[doc_id],(err,results)=>{
      if(results.length ==0){
        var sql="insert into AboutDoctor(id,description,doc_id) values(?,?,?)";
        connection.query(sql,[id,about,doc_id],(err,resultsins)=>{
          if(err){
            return reject(err)
          }
          else{
            return resolve(resultsins)
          }

        })

      }
      else{
        var sql="update AboutDoctor set description=? where doc_id=?";
   
        connection.query(sql,[about,doc_id],(err,resultsupd)=>{
          if(err){
            return reject(err)
          }
          else{
            return resolve(resultsupd)
          }
    
        })
      }

    })
   

  })
}

router.post('/aboutdoctor', async (req,res)=>{
  
  
  try{
    if(req.session.DOC){
      let doc_id=req.session.DOC.user_id
      about=req.body.aboutDoc
      id=randomnumbers(10)

      const updateabout= await onlyupdateabout(id,about,doc_id);
      res.status(200).send(updateabout)

    }
    else{
      res.status(400).send('NOT ALLOWED')
    }

  }
  catch(error){
    console.log(error)
    res.status(400).send(error)
  }
 
})



onlydoctorimg=(image,doc_id)=>{
  return new Promise((resolve,reject)=>{
    var sql="select image from AboutDoctor where doc_id=?";
    connection.query(sql,[doc_id],(err,results)=>{
      fs.writeFile(
        './public/chambarimages/' +
        results[0].image,
        './public/chambarimages/' + image,
        error => {
          if (error) throw error;
        }
      );
      fs.unlink(
        './public/chambarimages/' +
        results[0].image,
        error => {
          if (error) throw error;
        }
      );
      var sql="update AboutDoctor set image=? where doc_id=?";
      connection.query(sql,[image,doc_id],(err,resultsupdate)=>{

        if(err){
          return reject(err)
        }
        else{
          return resolve(resultsupdate)
        }

      })

    })
  })
}


router.put('/doctorimage',upload.single('doctorimg'),async (req,res)=>{
  console.log(req.file);
  console.log(req.session.DOC.user_id)

  if(req.session.DOC){
    if(req.file!=null){
      let doc_id=req.session.DOC.user_id
      image=req.file.filename
      id=randomnumbers(10)

     

    }
    else{
      res.status(400).send('IMAGE FIELD IS REQUIRED')
    }

  }
  else{
    res.status(400).send('NOT ALLOWED')
  }

  

})

getdoctorname=(doc_id)=>{
  return new Promise((resolve,reject)=>{
    var sql="select doctorname from Doctor where doc_id=?";
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


router.get('/doctorname',async (req,res)=>{
  try{
    if(req.session.DOC){
      let  doc_id=req.session.DOC.user_id

      const getname= await getdoctorname(doc_id);
      res.status(200).send(getname)

    }
    else{
      res.status(400).send('NOT ALLOWED')
    }

  }
  catch(error){
    res.status(200).send(error)
  }
})


module.exports=router;

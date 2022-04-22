const express=require('express');
const router=express.Router();
const {connection}=require('../db');

const {randomnumbers} =require('../randomgenerator/randomnumber');
const multer=require('multer');
let fs=require('fs')


getwhy=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from whyHome";
        connection.query(sql,(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results);
            }
        })
    })
}

router.get('/whyabout',async (req,res)=>{
    try{
        const get=await getwhy();
        res.status(200).send(get)

    }
    catch(error){
        res.status(400).send(error)
    }
})

//----------------------------------------insert whyHomeo-------------------------------------------//

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

//Multer Mime Type Validation
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
  })

  whyaboutpost=(id,image,description,highlights)=>{
      return new Promise((resolve,reject)=>{
          var sql="insert into whyHome(id,image,description,highlights) values(?,?,?,?)";
          connection.query(sql,[id,image,description,highlights],(err,results)=>{
              if(err){
                  return reject(err)
              }
              else{
                  return resolve(results)
              }

          })
      })

  }

  whywithoutimage=(id,description)=>{
      return new Promise((resolve,reject)=>{
          var sql="insert into whyHome(id,description) values(?,?) ";
          connection.query(sql,[id,description],(err,results)=>{
              if(err){
                  return reject(err)
              }
              else{
                  return resolve(results)
              }

          })
      })
  }

  router.post('/whyabout',upload.single('whyhomeo'),async (req,res)=>{
      console.log(req.body)
      try{
          if(req.file!=null){
              let id=randomnumbers(10)
              image=req.file.filename
              description=req.body.description
              highlights=req.body.highlights

              const whyins= await whyaboutpost(id,image,description,highlights);
              res.status(200).send(whyins)


          }
          else{
              let id=randomnumbers(10)
              description=req.body.description
              

              const whyinsert= await whywithoutimg(id,description)
              res.status(200).send(whyinsert)

          }

      }
      catch(error){
          res.status(400).send(error)
      }
  })




whygetbyid=(id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from  whyHome where id=?";
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



  router.get('/whyabout/:id',async (req,res)=>{
      try{
          let id=req.params.id

          const getwhy=await whygetbyid(id);
          res.status(200).send(getwhy);

      }
      catch(error){

      }
  })











  whywithoutimage=(id,description,highlights)=>{
      return new Promise((resolve,reject)=>{
          var sql="update whyHome set description=?,highlights=? where id=?";
          connection.query(sql,[description,highlights,id],(err,results)=>{
              if(err){
                  return reject(err)
              }
              else{
                  return resolve(results)
              }

          })
      })

  }



  whywithimage=(id,image,description,highlights)=>{
      return new Promise((resolve,reject)=>{
          var sql="select image from whyHome where id=?";
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

                  var sql="update whyHome set image=?,description=?,highlights=? where id=?";
                  connection.query(sql,[image,description,highlights,id],(err,results1)=>{
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
  router.put('/whyabout/:id',upload.single('whyhome'),async (req,res)=>{
     
     
      try{
          if(req.file!=null){
              let id=req.params.id
              image=req.file.filename
              description=req.body.description
              highlights=req.body.highlights


              const updatewhy= await whywithimage(id,image,description,highlights);
              res.status(200).send(updatewhy)

          }
          else{

            let id=req.params.id
             
              description=req.body.description
              highlights=req.body.highlights


              const updatewhyhome= await whywithoutimage(id,description,highlights);
              res.status(200).send(updatewhyhome)


          }

      }
      catch(error){

      }
  })

module.exports=router;
const express=require('express')
const router=express.Router();
let {connection}=require('../db');
let {randomnumbers}=require('../randomgenerator/randomnumber')
let multer=require('multer')
let fs=require('fs');


//-------------------------------insert Achevements----------------------//




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


achievementInsert=(ach_id,name,image)=>{
    return new Promise((resolve,reject)=>{
       
       
        var sql="insert into Achievements(ach_id,name,image) values(?,?,?) ";
        connection.query(sql,[ach_id,name,image],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                
                return resolve(results)

            }
        })

    })
}


withoutachievementsimg=(ach_id,name)=>{
    return new Promise((resolve,reject)=>{

        var sql="insert into Achievements(ach_id,name) values(?,?)";
        connection.query(sql,[ach_id,name],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}
router.post('/achievements',upload.single('achievementimage'),async(req,res)=>{
   
   
  
    try{
        if(req.file!=null){
            
         let ach_id=randomnumbers(10)
         name=req.body.name
         image=req.file.filename

       const insertach=await achievementInsert(ach_id,name,image)
       res.status(200).send(insertach)


        }
        else{
            let ach_id=randomnumbers(10)
            name=req.body.name
            

           
            const withoutach= await withoutachievementsimg(ach_id,name);
            res.status(200).send(withoutach)
        }


    }
    catch(error){
        console.log(error)
        res.status(400).send(error)
    }
})


fetchallach=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from Achievements";
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


router.get('/achievements',async (req,res)=>{
    try{
        let achievements= await fetchallach();
        res.status(200).send(achievements)

    }
    catch(error){
        res.status(400).send(error)

    }
})










updateimage=(ach_id,name,image)=>{
    return new Promise((resolve,reject)=>{
        var sql="select image from Achievements where  ach_id=?";
        connection.query(sql,[ach_id],(err,results)=>{
            console.log(results[0].image)
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

              let sql="update Achievements set name=?,image=? where ach_id=?";
              connection.query(sql,[name,image,ach_id],(err,results1)=>{
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

upadtewithoutimage=(name,ach_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="update Achievements set name=? where  ach_id=?";
        connection.query(sql,[name,ach_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })

}
router.put('/achievements/:id',upload.single('achievementimage'),async (req,res)=>{
    
    console.log(req.params.id)

    try{
        if(req.file!=null){
            let ach_id=req.params.id
            name=req.body.name
            image=req.file.filename

            let updateach= await updateimage(ach_id,name,image);
            res.status(200).send(updateach)


        }else{
           let  name=req.body.name
           ach_id=req.params.id

           let updateachie=await upadtewithoutimage(name,ach_id);
           res.status(200).send(updateachie)
        }
    }
    catch(error){
        res.status(400).send(error)
    }

})



achievementDelete=(ach_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select image from Achievements where  ach_id=?";
        connection.query(sql,[ach_id],(err,results)=>{
            fs.unlink(
                './public/chambarimages/' +
                results[0].image,
                error => {
                  if (error) throw error;
                }
              );

              let sql="delete from Achievements where ach_id=?";
              connection.query(sql,[ach_id],(err,results2)=>{
                  if(err){
                      return reject(err)
                  }
                  else{
                      return resolve(results2)
                  }

              })

        })
    })
}

achievementsdeletebyid=(ach_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="delete from Achievements where ach_id=?";
        connection.query(sql,[ach_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}


router.delete('/achievements/:id',async (req,res)=>{
   

    
    try{
        let  ach_id=req.params.id;

        const deleteup=await achievementsdeletebyid(ach_id)
        res.status(200).send(deleteup)

        //const deleteach= await achievementDelete(ach_id);
        //res.status(200).send(deleteach)




    }
    catch(error){
        console.log(error)
        res.status(400).send(error)
    }
})



fetchachievementsbyid=(ach_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from Achievements where ach_id=?";

        connection.query(sql,[ach_id],(err,results)=>{

            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })

    })
}
router.get('/achievements/:id',async (req,res)=>{
    try{
        let ach_id=req.params.id

        const fetchid= await fetchachievementsbyid(ach_id);

        res.status(200).send(fetchid)

    }
    catch(error){
        
      res.status(400).send(error)
    }
  
})

module.exports=router
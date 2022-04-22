const express=require('express')
const router=express.Router()
const {connection} =require('../db');
const {randomnumbers}=require('../randomgenerator/randomnumber')
const multer=require('multer')
let fs=require('fs');

getblogs=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from Homeoblogs ";
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


router.get('/blogs',async (req,res)=>{
    try{
        const get= await getblogs();
        res.status(200).send(get)

    }
    catch(error){
        res.status(400).send(error)
    }
})

//--------------------------------------insert blogs----------------------------------//




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
      
    }
  },
});


postblogs=(id,image,title,description,link,doc_id,showblogs)=>{
    return new Promise((resolve,reject)=>{
       
        var sql="insert into  Homeoblogs (id,image,title,description,link,doc_id,showblogs) values(?,?,?,?,?,?,?) ";
        connection.query(sql,[id,image,title,description,link,doc_id,showblogs],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}

router.post('/blogs',upload.single('blogsimage'),async (req,res)=>{
   
    try{
        if(req.file!=null){
            let id=randomnumbers(10)
            image=req.file.filename
            title=req.body.title
            description=req.body.description
            link=req.body.link
            doc_id=req.session.ADMIN.user_id ?? '0'
            showblogs=req.body.showblogs


            const bloginsert= await postblogs(id,image,title,description,link,doc_id,showblogs);
            res.status(200).send(bloginsert)

        }
        else{
            
            res.status(400).send('IMAGE FIELD IS REQUIRED AND IMAGE MUST BE JPEG OR PNG OR JPG')
        }

    }
    catch(error){
        console.log(error)
        res.status(400).send(error)
    }
})

//-----------------------------blogs get by id------------------------------------------//

getblogbyid=(id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from Homeoblogs  where id=?";
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


router.get('/blogs/:id',async (req,res)=>{
    try{
        let id=req.params.id

        const getid=await getblogbyid(id);
        res.status(200).send(getid)

    }
    catch(error){
        res.status(400).send(error)
    }

})


//---------------------------------update blogs----------------------------------------//


UpdateBlogswithimg=(id,image,title,description,link,doc_id,showblogs)=>{
    return new Promise((resolve,reject)=>{
       var sql="select image from Homeoblogs  where id=?";
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

              var sql="update Homeoblogs set image=?,title=?,description=?,link=?,doc_id=?,showblogs=? where id=?";
              connection.query(sql,[image,title,description,link,doc_id,showblogs,id],(err,results1)=>{
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






router.put('/blogs/:id',upload.single('blogsimage'),async (req,res)=>{
    console.log(req.body)
    console.log(req.file)
    console.log(req.params.id)
    try{
       if(req.file!=null){
           let id=req.params.id
           image=req.file.filename
           title=req.body.title
           description=req.body.description
           link=req.body.link
           doc_id=req.session.ADMIN.user_id ?? '0'
           showblogs=req.body.showblogs


           const updateblogs= await UpdateBlogswithimg(id,image,title,description,link,doc_id,showblogs);
           res.status(200).send(updateblogs)

       }
       else{
           let id=req.params.id
           title=req.body.title
           description=req.body.description
           showblogs=req.body.showblogs
           link=req.body.link
           

           const  blogsupdate= await UpdateBlogswithoutimg(id,title,description,showblogs,link);
           res.status(200).send(blogsupdate)

       }
    }
    catch(error){
        res.status(400).send(error)

    }
})




UpdateBlogswithoutimg=(id,title,description,showblogs,link)=>{
    return new Promise((resolve,reject)=>{
        var sql="update Homeoblogs set  title=?,description=?,showblogs=?,link=? where id=?";
        connection.query(sql,[title,description,showblogs,link,id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}










blogsdelete=(id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select image from Homeoblogs where  id=?";
        connection.query(sql,[id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                fs.unlink(
                    './public/chambarimages/' +
                    results[0].image,
                    error => {
                      if (error) throw error;
                    }
                  );
                  var sql="delete from Homeoblogs where id=?";
                  connection.query(sql,[id],(err,results)=>{
                      if(err){
                          return reject(err)
                      }
                      else{
                          return resolve(results)
                      }

                  })
            }
        })
        
    })
}



router.delete('/blogs/:id',async (req,res)=>{
    try{
        let id=req.params.id

        let deleteblogs=await blogsdelete(id);
        res.status(200).send(deleteblogs)

    }
    catch(error){
        res.status(400).send(error)
    }
})


Blogsshowuser=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select  * from Homeoblogs where showblogs=?";
        connection.query(sql,[1],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}

router.get('/showblogs',async (req,res)=>{
    try{

        const getshowblogs= await Blogsshowuser();
        res.status(200).send(getshowblogs)

    }
    catch(error){
        res.status(400).send(error)
    }
})
module.exports=router;
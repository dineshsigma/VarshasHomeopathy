const express = require("express");
const router = express.Router();

var multer = require("multer");
const { connection } = require("../db.js");

const DIR = "./public/chambarimages";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
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
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

//-------------------------------------------fetch all logos-----------------------------------------//

logofetch = () => {
  return new Promise((resolve, rejects) => {
    var sql = "select * from logotable";
    connection.query(sql, (error, results) => {
      if (error) {
        return rejects(error);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/fetch", async (req, res) => {
  try {
    const fetchlogo = await logofetch();
    res.status(200).send(fetchlogo);
  } catch (error) {
    res.status(400).send(error);
  }
});

///--------------------------------------logo insert------------------------------------///

Insertlogo = (id, brand, logoimages) => {
  return new Promise((resolve, reject) => {
    var sql = " insert  into logotable(id,brand,logoimages) values(?,?,?)";
    connection.query(sql, [id, brand, logoimages], (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

router.post("/insert", upload.single("image"), async (req, res) => {
  // console.log(req.file);
  //console.log(req.body.name);
  //console.log(req.body);

  try {
    if (req.file != null) {
      const id = req.body.id,
        brand = req.body.name,
        logoimages = req.file.filename;

      const insert = await Insertlogo(id, brand, logoimages);
      req.session.logo = logoimages;
      res.status(200).send(insert);
    } else {
      res.status(400).send("logo image field is required");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//--------------------------------delete logoimages-------------------------------------//

const fs = require("fs");
logoDelete = (id) => {
  return new Promise((resolve, reject) => {
    var sql = "select * from logotable where id=?";
    connection.query(sql, [id], (error, results) => {
      if (error) {
        return reject(error);
      } else {
        fs.unlink(
          "./public/chambarimages/" + results[0].logoimages,
          (error) => {
            if (error) throw error;
          }
        );
      }
      var sql = "delete from logotable where id=?";
      connection.query(sql, [id], (error, results) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(results);
        }
      });
    });
  });
};

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const logdelete = await logoDelete(id);
    res.status(200).send(logdelete);
  } catch (error) {
    res.status(400).send(error);
  }
});

//------------------------------------------------------update logo table--------------------------------------------------------//

logoUpdate = (id, brand, logoimages, about) => {
  return new Promise((resolve, reject) => {
    var sql = "select logoimages from logotable where id=" + id;
    connection.query(sql, (error, results) => {
      if (error) {
        return reject(error);
      } else {
        fs.writeFile(
          "./public/chambarimages/" + results[0].logoimages,
          "./public/chambarimages/" + logoimages,
          (error) => {
            if (error) throw error;
            fs.unlink(
              "./public/chambarimages/" + results[0].logoimages,
              (error) => {
                if (error) throw error;
              }
            );
          }
        );
      }
      var sql =
        "update logotable set brand=?,logoimages=?,about=? where id=" + id;
      connection.query(
        sql,
        [brand, logoimages, about, id],
        (error, results) => {
          if (error) {
            return reject(error);
          } else {
            return resolve(results);
          }
        }
      );
    });
  });
};

router.put("/update", upload.single("image"), async (req, res) => {
  console.log(req.body.name);

  try {
    if (req.file != null) {
      const id = 1,
        brand = req.body.name,
        logoimages = req.file.filename;
      about = req.body.about;

      const update = await logoUpdate(id, brand, logoimages, about);
      res.status(200).send(update);
    } else {
      const id = 1,
        brand = req.body.name;
      about = req.body.about;
      const upload = await logoupdatewithoutimage(id, brand, about);
      res.status(200).send(upload);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

logoupdatewithoutimage = (id, brand, about) => {
  new Promise((resolve, reject) => {
    var sql = "update logotable set brand=? ,about=? where id=?";
    connection.query(sql, [brand, about, id], (err, res) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(res);
      }
    });
  });
};

///--------------------------------------------fetch logo by id----------------------------------------------//

fetchLogoById = (id) => {
  return new Promise((resolve, reject) => {
    var sql = "select * from logotable where id=?";
    connection.query(sql, [id], (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/fetch/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const logofetchById = await fetchLogoById(id);
    res.status(200).send(logofetchById);
  } catch (error) {
    res.status(400).send(error);
  }
});

//----------------------------------------fetch  only logoimages from logotable--------------------------------------------------//

router.get("/image", (req, res) => {
  var sql = "select logoimages from logotable";
  connection.query(sql, (error, results) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(200).send(results);
    }
  });
});

/*
logoinsup=(id,logoimages,brand)=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from logotable where id=?";
        connection.query(sql,[id],(error,results)=>{
            if(results.length>0){
                console.log('alredy logo is there');
                var sql="update logotable set brand=?,logoimages=? where id=?";
                let data=[brand,logoimages,id];
                return resolve(results);


            }
            else{
                var sql="insert into logotable(id,brand,logoimages) values(?,?,?)";
                let data=[id,logoimages,brand];
                connection.query(sql,data,(error,results)=>{
                    if(error) throw error;
                    return resolve(results);
                })

            }
        })
    })

}



/*
router.post('/insert',upload.single('logoimages'),async (req,res)=>{
   try{
       const id=16,
       logoimages=req.body.logoimages,
       brand=req.body.brand
       const uploadlogo= await logoinsup(id,logoimages,brand);

       res.status(200).send(uploadlogo);

   }
   catch(error){
       res.status(400).send(error);
   }
})
*/

/*
router.post('/insert',upload.single('logoimages'),(req,res,next)=>{
    console.log("heloooo");
    const logo={
        id:req.body.id,
        logoimages:req.file.filename

    }

    var sql="insert into logotable set ?";
    db.query(sql,logo,(error,results)=>{
        if(error){
            res.status(400).send(error);
        }
        else{
            res.status(200).send(results);
        }
    })
})

router.get('/fetch',(req,res)=>{
    console.log("heloooo");
    var sqi="select * from logotable";
    db.query(sql,(error,results)=>{
        if(error){
            res.status(400).send(error);
        }
        else{
            res.status(200).send(results);
        }
    })
})

router.get('/fetch/:id',(req,res,next)=>{
    console.log("helooo fetch by id");
    var id=req.params.id;
    console.log(id);
    var sql="select * from  logotable where id=?";
    db.query(sql,[id],(error,results)=>{
        if(error){
            res.status(400).send(error);
        }
        else{
            res.status(200).send(results);
        }
    })
})

router.delete('/delete/:id',(req,res,next)=>{
    var id=req.params.id;
    console.log(id);

var sql="select logoimages from logotable where id=?";
db.query(sql,[id],(error,results)=>{
    if(error){
        res.status(400).send(error);
    }
    else{
        console.log(results[0].logoimages);
        fs.unlink('./public/uploadimages'+results[0].logoimages,(error)=>{
            console.log("file is deleted");
            console.log(error);
        })

    }
})



    var sql="delete from logotable where id=?";
    db.query(sql,[id],(error,results)=>{
        if(error){
            res.status(400).send(error);
        }
        else{
            res.status(200).send(results);
        }
    })
})

router.put('/update',(req,res,next)=>{
    console.log("heloo update");
    var sql="update logotable set logoimages=? where id=?";
    let data=[req.file.filename,id];
    db.query(sql,data,(error,results)=>{
        if(error){
            res.status(400).send(error);
        }
        else{
            res.status(200).send(results);
        }
    })
})
*/
module.exports = router;

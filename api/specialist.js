var express = require('express');
let router = express.Router();
let fs=require('fs');

let { connection } = require('../db');

let sharp=require('sharp')
let multer = require('multer');
const { randomnumbers } = require('../randomgenerator/randomnumber');
const { reject } = require('bcrypt/promises');
const FOLDER = './public/chambarimages';
const path=require('path')

let storage = multer.diskStorage({
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
Specialistfetch = () => {
    return new Promise((resolve, reject) => {
        var sql = "select * from speacalist WHERE isactive=1";
        connection.query(sql, (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }
        })
    })
}

router.get('/fetch', async (req, res) => {
    try {
        let fetchspecialist = await Specialistfetch();
        res.status(200).send(fetchspecialist);

    }
    catch (error) {
        res.status(400).send(error)

    }
})
let SpecialistAddd = (name, details, status, isactive, image, category) =>
    new Promise((resolve, reject) => {
       
        console.log(name,details,status,isactive,image,category)

        let sql = 'INSERT INTO speacalist(name,details,status,isactive,image,category) VALUES(?,?,?,?,?,?)'
        connection.query(sql, [name, details, status, isactive, image, category], (err, res) => {
            console.log(err)
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
router.post('/add', upload.single("avatar"), async (req, res) => {
   


    try {
        if (req.file != null) {
            
           
        
           

            let name = req.body.name

            details = req.body.details
            status = req.body.status
            category = req.body.category
            image = req.file.filename
            isactive = req.body.isactive ?? 1

          let results =  SpecialistAddd(name, details, status, isactive, image, category)
            res.send(results).status(200)
        }
        else {
            res.status(400).send({ message: "IMAGE FIELD IS REQUIRED" })
        }
    }
    catch (error) {

        res.send(error).status(500)

    }
})
let SpecialistUpdate = (name, details, status, isactive, id, image, category) =>
    new Promise((resolve, reject) => {
        var sql="select image from speacalist where id=?";
        connection.query(sql,[id],(err,results4)=>{
            if(err){
                return reject(err)
            }
            else{
                fs.writeFile('./public/chambarimages/'+results4[0].image,'./public/chambarimages/'+image,(error)=>{
                    if(error) throw error;
                    fs.unlink('./public/chambarimages/'+results4[0].image,(error)=>{
                      if(error) throw error;
                    })
                  })
            }

        console.log(image);
        let sql = 'UPDATE speacalist SET name=?,details=?,status=?,isactive=? ,image=?,category=? WHERE id=?'
        connection.query(sql, [name, details, status, isactive, image, category, id], (err, res) => {
            if (err) reject(err)

            if (res) resolve(res)
        })
    })
    })
router.put('/update/:id', upload.single('avatar'), async (req, res) => {


    try {
        if (req.file != null) {

            let id = req.params.id
            name = req.body.name
            details = req.body.details
            image = req.file.filename
            category = req.body.category
            status = req.body.status
            isactive = req.body.isactive ?? 1
            let results = await SpecialistUpdate(name, details, status, isactive, id, image, category)
            res.send(results).status(200)
        }
        else {
            id = req.params.id
            let name = req.body.name
            details = req.body.details
            image = req.body.image
            category = req.body.category
            status = req.body.status
            isactive = req.body.isactive ?? 1
            let results = await Specialistfetchnotimage(name, details, status, isactive, id, category, image)
            res.send(results).status(200)

        }
    } catch (error) {

        res.send(error).status(500)

    }
})
Specialistfetchnotimage = (name, details, status, isactive, id, category, image) => {

    return new Promise((resolve, reject) => {
        var sql = "select image from speacalist where id=?";
        connection.query(sql, [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {

                var sql = "update speacalist set name=?,details=?,status=?,isactive=?,category=?,image=? where id=?";
                connection.query(sql, [name, details, status, isactive, category, results[0].image, id], (error, results1) => {
                    if (error) {
                        return reject(error);
                    }
                    else {
                        return resolve(results1);
                    }

                })
            }

        })
    })

}


let SpecialistRevoke = id =>
    new Promise((resolve, reject) => {
        let sql = "UPDATE speacalist SET isactive=0  WHERE ID=?"
        connection.query(sql, id, (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
router.delete('/revoke/:id', async (req, res) => {
    try {
        let id = req.params.id
        let results = await SpecialistRevoke(id)
        res.send(results).status(200)
    } catch (error) {
        res.send(error).status(500)

    }
})

specalistcategory = () => {
    return new Promise((resolve, reject) => {
        var sql = "select * from specalistscategory where isactive=1";
        connection.query(sql, (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }
        })
    })
}

router.get('/catfetch', async (req, res) => {
    try {
        let fetchblogcategory = await specalistcategory();

        res.status(200).send(fetchblogcategory);

    }
    catch (error) {

        res.status(400).send(error);

    }
})

specalistscategory = (id) => {
    return new Promise((resolve, reject) => {
        var sql = "select * from specalistscategory where id=?";
        connection.query(sql, [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }

        })
    })
}

router.get('/catfetch/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let fetchcat = await specalistscategory(id);
        res.status(200).send(fetchcat);
    }
    catch (error) {
        res.status(400).send(error);
    }
})


router.post('/catinsert', upload.single('avatar'), async (req, res) => {

    try {
        if (req.file != null) {
            id = randomnumbers(5)
            let name = req.body.name
            image = req.file.filename
            status = parseInt(req.body.status)
            details = req.body.details
            isactive = req.body.isactive ?? 1
            let post = await specalistscategoryinsert(id, details, name, status, isactive, image);
            res.status(200).send(post);
        }
        else {
            res.status(400).send({ message: "Image filed is required" })
        }
    }
    catch (error) {

        res.status(400).send(error);
    }

})


specalistscategoryinsert = (id, details, name, status, isactive, image) => {

    return new Promise((resolve, reject) => {
        var sql = "insert into specalistscategory(id,DETAILS,name,status,isactive,image) values(?,?,?,?,?,?)";
        connection.query(sql, [id, details, name, status, isactive, image], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }

        })
    })
}

let updatespecalistsCatWithImage = (id, name, details, status, image) =>
    new Promise((resolve, reject) => {
       
       
        var sql="select image from specalistscategory where id=?"
        connection.query(sql,[id],(err,results2)=>{
            
            if(err){
                return reject(err)
            }
            else{
                fs.writeFile('./public/chambarimages/'+results2[0].image,'./public/chambarimages/'+image,(error)=>{
                    if(error) throw error;
                    fs.unlink('./public/chambarimages/'+results2[0].image,(error)=>{
                      if(error) throw error;
                    })
                  })
            }
           

        let sql = "UPDATE specalistscategory SET name=?,DETAILS=?, status=?,image=? where id=?"
        connection.query(sql, [name, details, status, image, id], (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
    })
let updatespecalistsCat = (id, name, details, status) =>
    new Promise((resolve, reject) => {
        let sql = "UPDATE specalistscategory SET name=?,DETAILS=?, status=? where id=?"
        connection.query(sql, [name, details, status, id], (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
router.put('/catupdate/:id', upload.single('avatar'), async (req, res) => {
    console.log("ljchgcsd")
   
    try {
        if (req.file!=null) {
         

            id = req.params.id
            let name = req.body.name
            let details = req.body.details
            status = parseInt(req.body.status)
            let image = req.file.filename
            let results = await updatespecalistsCatWithImage(id, name, details, status, image)
            res.send(results).status(200)
        }
        else {
            id = req.params.id
            let name = req.body.name
            let details = req.body.details
            status = parseInt(req.body.status)

            let results = await updatespecalistsCat(id, name, details, status)
            res.send(results).status(200)
        }
    } catch (error) {
        res.send(error).status(500)
    }
})



specalistscategoryupdate = (id, name, details, status, image) => {
    return new Promise((resolve, reject) => {
        var sql = "select image from specalistscategory where id=?";
        connection.query(sql, [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                var sql = "update specalistscategory set name=?,details=?,status=?,image=? where id=?";
                connection.query(sql, [name, details, status, results[0].image, id], (error, results1) => {
                    if (error) {
                        return reject(error);
                    }
                    else {
                        return resolve(results1);
                    }
                })
            }
        })
    })

}


let deletespecalistsCat = id =>
    new Promise((resolve, reject) => {
        let sql = 'UPDATE specalistscategory SET isactive=0 WHERE id=?'
        connection.query(sql, id, (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
router.delete('/catdelete/:id', async (req, res) => {
    try {
        id = req.params.id
        let results = await deletespecalistsCat(id)
        res.send(results).status(200)
    } catch (error) {
        res.send(error).status(500)
    }
})
let specalistByCat = category =>
    new Promise((resolve, reject) => {
        let sql = "SELECT * FROM speacalist WHERE category =? AND isactive=1"
        connection.query(sql, category, (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
router.get('/catgetbyid/:id', async (req, res) => {
    try {
        let category = req.params.id
        let results = await specalistByCat(category)
        res.status(200).send(results)
    } catch (error) {
        res.status(500).send({ message: "error occured" })

    }
})



specalistSearch = (searchkey) => {
    return new Promise((resolve, reject) => {

        var sql = "select * from speacalist where speacalist.name LIKE  ?";
        connection.query(sql, searchkey, (error, results) => {
            if (error) {
                return reject(error)
            }
            else {
                return resolve(results);
            }
        })
    })

}

router.get('/searchspecialist/:searchkey', async (req, res) => {
    try {
        searchkey = '%' + req.params.searchkey + '%'

        let search = await specalistSearch(searchkey);
        res.status(200).send(search);



    }
    catch (error) {

        res.status(400).send(error);
    }
})


router.get('/filtersall/:searchkey', (req, res) => {
    searchkey = '%' + req.params.searchkey + '%'
    //var sql="select * from Doctor d,speacalist s,Chambar c where  d.doctorname LIKE ?  || s.name LIKE ? || c.chambarname LIKE ? ";
    //var sql="select count(*) as noofspecalist ,s.name ,s.id from Profileinfo p,speacalist s where s.id=p.specialist   group by p.specialist having  s.name Like ? ";
    var sql = "select * from  speacalist s where s.name LIKE ? ";
    let search = []
    connection.query(sql, searchkey, (error, results) => {
        if (error) {
            res.status(400).send(error);
        }
        else {

            let specialist = {
                name: 'specalist',
                data: results,

            }
            search.push(specialist)


            var sql = "select  * from  Doctor d where d.doctorname LIKE ?";
            //var sql="select * from Profileinfo p where p.name LIKE ?"
            connection.query(sql, searchkey, (error, results1) => {
                if (error) {
                    res.status(400).send(error);
                }
                else {

                    let doctor = {
                        name: 'doctor',
                        data: results1
                    }
                    search.push(doctor)
                    res.status(200).send(search);


                }


            })
        }

    })



})

module.exports = router;
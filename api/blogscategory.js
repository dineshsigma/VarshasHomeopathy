const { reject } = require('bcrypt/promises');
const { response } = require('express');
let express = require('express');
let router = express.Router();
let { connection } = require('../db.js');
const { randomnumbers } = require('../randomgenerator/randomnumber.js');
let multer = require('multer')
let fs=require('fs')
const FOLDER = './public/chambarimages';
const sharp=require('sharp')
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
blogcategory = () => {
    return new Promise((resolve, reject) => {
        var sql = "select * from blogscategory where isactive=1";
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
        let fetchblogcategory = await blogcategory();
        res.status(200).send(fetchblogcategory);

    }
    catch (error) {
        res.status(400).send(error);

    }
})

fetchcategory = (id) => {
    return new Promise((resolve, reject) => {
        var sql = "select * from blogscategory where id=?";
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

router.get('/fetch/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let fetchcat = await fetchcategory(id);
        res.status(200).send(fetchcat);
    }
    catch (error) {
        res.status(400).send(error);
    }
})



router.post('/insert', upload.single('avatar'), async (req, res) => {

    try {
        if (req.file != null) {
            let name = req.body.name
            image = req.file.filename
            status = parseInt(req.body.status)
            details = req.body.details
            isactive = req.body.isactive ?? 1
            let post = await postblogscategory(details, name, status, isactive, image);
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


postblogscategory = (details, name, status, isactive, image) => {

    return new Promise((resolve, reject) => {
        var sql = "insert into blogscategory(DETAILS,name,status,isactive,image) values(?,?,?,?,?)";
        connection.query(sql, [details, name, status, isactive, image], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }

        })
    })
}
let updateBlogsCatWithImage = (id, name, details, status, image) =>
    new Promise((resolve, reject) => {
        var sql="select image from blogscategory where id=?";
        connection.query(sql,[id],(err,results1)=>{
            if(err){
                return reject(err)
            }
            else{
                fs.writeFile('./public/chambarimages/'+results1[0].image,'./public/chambarimages/'+image,(error)=>{
                    if(error) throw error;
                    fs.unlink('./public/chambarimages/'+results1[0].image,(error)=>{
                      if(error) throw error;
                    })
                  })
            }

        
        let sql = "UPDATE blogscategory SET name=?,DETAILS=?, status=?,image=? where id=?"
        connection.query(sql, [name, details, status, image, id], (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
    })
let updateBlogsCat = (id, name, details, status) =>
    new Promise((resolve, reject) => {
        let sql = "UPDATE blogscategory SET name=?,DETAILS=?, status=? ,image=? where id=?"
        connection.query(sql, [name, details, status, image, id], (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
router.put('/update/:id', upload.single('avatar'), async (req, res) => {
    try {
        if (req.file) {

            id = req.params.id
            let name = req.body.name
            let details = req.body.details
            status = parseInt(req.body.status)
            let image = req.file.filename
            let results = await updateBlogsCatWithImage(id, name, details, status, image)
            res.send(results).status(200)
        }
        else {

            id = req.params.id
            let name = req.body.name
            let details = req.body.details
            status = parseInt(req.body.status)

            let results = await updateBlogsCat(id, name, details, status)
            res.send(results).status(200)
        }
    } catch (error) {
        res.send(error).status(500)
    }
})


fetchBlogsCat = (id, name, details, status, image) => {
    return new Promise((resolve, reject) => {
        var sql = "select image from blogscategory where id=?";
        connection.query(sql, [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                var sql = "update blogscategory set name=?,details=?,status=?,image=? where id=?";
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



let deleteBlogCat = id =>
    new Promise((resolve, reject) => {
        let sql = 'UPDATE blogscategory SET isactive=0 WHERE id=?'
        connection.query(sql, id, (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
router.delete('/delete/:id', async (req, res) => {
    try {
        id = req.params.id
        let results = await deleteBlogCat(id)
        res.send(results).status(200)
    } catch (error) {
        res.send(error).status(500)
    }
})

let addBlog = (name, category, details, status, image, isactive) =>
    new Promise((resolve, reject) => {
        let sql = "INSERT INTO blogs (name, category, details, status, image,isactive) VALUES(?,?,?,?,?,?)"
        connection.query(sql, [name, category, details, status, image, isactive], (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
router.post('/blogsadd', upload.single('avatar'), async (req, res) => {
    const{filename:image}=req.file;
    await  sharp(req.file.path).resize(250,250).jpeg({
        quality:90
    }).toFile(path.resolve(req.file.destination,"resize",image))
    fs.unlinkSync(req.file.path)

    try {
        if (req.file != null) {

            let name = req.body.name
            let category = req.body.category
            let details = req.body.details
            let status = req.body.status
            let image = req.file.filename ?? ''
            isactive = req.body.isactive ?? 1
            let results = await addBlog(name, category, details, status, image, isactive)
            res.send(results).status(200)
        }
        else {
            res.status(400).send({ message: "IMAGE FIELD IS REQUIRED" })
        }
    } catch (error) {
        res.send(error).status(500)
    }
})
let blogsfetch = () =>
    new Promise((resolve, reject) => {
        let sql = "SELECT * FROM blogs WHERE isactive=?"
        connection.query(sql, 1, (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
router.get('/blogsfetch', async (req, res) => {
    try {
        let results = await blogsfetch()
        res.send(results).status(202)
    } catch (error) {
        res.send(error).status(500)

    }
})
let blogsupdatewithimage = (name, category, details, status, image, id) =>
    new Promise((resolve, reject) => {
        let sql="select image from blogs where id=?";
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
        
        let sql = "UPDATE blogs SET name=?,category=?,details=?,status=?,image=? WHERE id=?"
        connection.query(sql, [name, category, details, status, image, id], (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
    })
let blogsupdatewithoutimage = (name, category, details, status, id) =>
    new Promise((resolve, reject) => {
        let sql = "UPDATE blogs SET name=?,category=?,details=?,status=? WHERE id=?"
        connection.query(sql, [name, category, details, status, id], (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })

router.put('/blogsupdate/:id', upload.single('avatar'), async (req, res) => {
    try {
        if (req.file) {
            id = req.params.id
            let name = req.body.name
            category = req.body.category
            details = req.body.details
            status = req.body.status
            image = req.file.filename
            let results = await blogsupdatewithimage(name, category, details, status, image, id)
            res.send(results).status(200)
        }
        else {
            id = req.params.id
            let name = req.body.name
            category = req.body.category
            details = req.body.details
            status = req.body.status
            let results = await blogsupdatewithoutimage(name, category, details, status, id)
            res.send(results).status(200)
        }

    } catch (error) {
        res.send(error).status(500)

    }
})
let blogsrevoke = id =>
    new Promise((resolve, reject) => {
        let sql = "UPDATE blogs SET isactive=0 WHERE id=?"
        connection.query(sql, id, (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
router.delete("/blogsrevoke/:id", async (req, res) => {
    try {
        let id = req.params.id
        let results = await blogsrevoke(id)
        res.send(results).status(200)
    } catch (error) {
        res.send(error).status(500)

    }
})
let blogsbycat = id =>
    new Promise((resolve, reject) => {
        let sql = "SELECT * FROM blogs WHERE category=? AND status=1"
        connection.query(sql, id, (err, res) => {
            if (err) reject(err)
            if (res) resolve(res)
        })
    })
router.get('/blogsbycat/:id', async (req, res) => {
    try {
        let id = req.params.id
        let results = await blogsbycat(id)
        res.status(200).send(results)
    } catch (error) {
        res.status(500).send(error)

    }
})
module.exports = router;
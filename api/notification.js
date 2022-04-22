let express = require('express');
let router = express.Router();
let { connection } = require('../db');
let jwt = require('jsonwebtoken');
let joi = require('joi');
require('dotenv').config();
let { mailer } = require('../transporter');


const { randomnumbers } = require('../randomgenerator/randomnumber');
const { reject } = require('bcrypt/promises');
let { hashSync } = require('bcrypt');


let insertpermission = (doc_id) =>


  new Promise((resolve, reject) => {

    let roll_id = randomnumbers(13)
    let perm = ['FULL_RIGHT']
    let sql = "INSERT INTO Rollbased(roll_id,doc_id,isActive,permission,USER_ID) VALUES(?,?,?,?,?)"
    let data = [roll_id, doc_id, 1, JSON.stringify(perm), doc_id];

    connection.query(sql, data, (err, results) => {
      if (err) {

      }


    })

  })
router.post(
  '/doctor/approve/:id',
  async (req, res) => {
    try {
      let doc_id = req.params.id;
      let access = req.body.access
      let schema = joi.object().keys({
        doctorname: joi.string(),
        email: joi.string().email(),
        access: joi.number().required(),
      });
      let { error } = schema.validate(req.body);
      if (error) {
        res
          .status(400)
          .send({ message: error.message });
      } else {
        let sql =
          'Update Doctor SET access=? WHERE doc_id=?';
        let result = await connection.query(
          sql,
          [
            access,
            doc_id
          ],
          (error, results) => {

            if (error)
              res.status(400).send({
                message: 'Error Inserting Data',
              });
            if (results) {
              let permission = insertpermission(doc_id)
              res.status(202).send({
                message:
                  'Doctor Verified Success',
              });
            }


          }
        );
      }
    } catch (error) {

    }
  }
);
let fetchDoctor = () =>
  new Promise((resolve, reject) => {
    var sql = "SELECT * FROM Doctor"
    connection.query(sql, (err, res) => {
      if (err) reject(err)
      if (res) resolve(res)
    })
  })
router.get('/doctor/fetchAll', async (req, res) => {
  try {
    let result = await fetchDoctor()
    res.send(result).status(200)
  } catch (error) {
    res.send(error).status(500)
  }
})
let revokeUser = user_id =>
  new Promise((resolve, reject) => {
    let sql = "UPDATE signup SET verified=0 WHERE user_id=?"
    connection.query(sql, [user_id], (err, res) => {
      if (err) reject(err)
      if (res) resolve(res)
    })
  })
router.put('/users/revoke/:id', async (req, res) => {
  try {
    let user_id = req.params.id
    let results = await revokeUser(user_id)

    res.send(results).status(202)
  } catch (error) {
    res.send(error).status(500)

  }
})
let revokeDoctor = user_id =>
  new Promise((resolve, reject) => {
    let sql = "UPDATE  Doctor SET access=1 WHERE doc_id=? AND access > 0"
    connection.query(sql, [user_id], (err, res) => {
      if (err) reject(err)
      if (res) resolve(res)
    })
  })
router.delete('/doctor/revoke/:id', async (req, res) => {
  try {
    let user_id = req.params.id
    let results = await revokeDoctor(user_id)

    res.send(results).status(202)
  } catch (error) {
    res.send(error).status(500)

  }
})
let updateUser = (user_id, name, email, verified) =>
  new Promise((resolve, reject) => {
    let sql = "UPDATE signup SET name=?,email=?,verified=? where user_id=?"
    connection.query(sql, [name, email, verified, user_id], (err, res) => {
      if (err) reject(err)
      if (res) resolve(res)
    })
  })
router.put('/users/update/:id', async (req, res) => {
  try {
    let user_id = req.params.id
    let name = req.body.name
    email = req.body.email
    verified = req.body.verified
    let results = await updateUser(user_id, name, email, verified)
    res.send(results).status(202)
  } catch (error) {
    res.send(error).status(500)
  }
})
let fetchUsers = () =>
  new Promise((resolve, reject) => {
    var sql = "SELECT * FROM signup WHERE accessLevel = 0"
    connection.query(sql, (err, res) => {
      if (err) reject(err)
      if (res) resolve(res)
    })
  })
router.get('/users/fetchAll', async (req, res) => {
  try {
    let result = await fetchUsers()
    res.send(result).status(200)
  } catch (error) {
    res.send(error).status(500)
  }
})
router.get(
  '/doctor/status/:id',
  async (req, res) => {
    try {
      let schema = joi.object().keys({
        id: joi.string().required(),
      });
      let { error } = schema.validate(req.params);
      if (error) {
        res
          .send(400)
          .send({ message: 'Invalid Details' });
      } else {
        let sql =
          'SELECT * FROM Doctor WHERE doc_id = ?';
        connection.query(
          sql,
          [req.params.id],
          (error, results) => {
            if (error)
              res.status(401).send({
                message: 'No such Doctor',
              });
            if (results)
              res
                .status(200)
                .send({ message: results });
          }
        );
      }
    } catch (error) { }
  }
);

let multer = require('multer');

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

//let randomnumbers=require('../randomgenerator/randomnumber')
//-------------------------------------admin page doctor insert-------------------------------------------//

router.post('/admindoctor', upload.single('avatar'), async (req, res) => {

  try {
    if (req.file != null) {
      if (req.session.ADMIN.user_id) {
        const doc_id = req.session.ADMIN.user_id,
          doctorimg = req.file.filename,
          doctorname = req.body.doctorname,
          email = req.body.email,
          gender = req.body.gender,
          phonenumber = req.body.phonenumber,
          access = req.body.access || 2;

        let admindoctor = await adminDoctor(doc_id, doctorimg, doctorname, email, gender, phonenumber, access);
        res.status(200).send(admindoctor);

      }
      else {
        res.status(403).send({ message: "NOT ALLOWED" })
      }

    }
    else {
      if (req.session.ADMIN) {
        const doc_id = req.session.ADMIN.user_id,
          doctorimg = req.body.doctorimg,
          doctorname = req.body.doctorname,
          email = req.body.email,
          gender = req.body.gender,
          phonenumber = req.body.phonenumber,
          access = req.body.access || 2;

        let postdoctor = await adminDoctor(doc_id, doctorimg, doctorname, email, gender, phonenumber, access);
        res.status(200).send(postdoctor);

      }
      else {
        res.status(403).send({ message: "NOT ALLOWED" });
      }

    }

  }
  catch (error) {
    res.status(400).send(error);

  }
})


adminDoctor = (doc_id, doctorimg, doctorname, email, gender, phonenumber, access) => {
  return new Promise((resolve, reject) => {
    var sql = "insert into Doctor(doc_id,doctorimg,doctorname,email,gender,phonenumber,access) values(?,?,?,?,?,?,?)";
    connection.query(sql, [doc_id, doctorimg, doctorname, email, gender, phonenumber, access], (error, results) => {
      if (error) {
        return reject(error);
      }
      else {

        let roll_id = randomnumbers(10),

          isActive = 1,
          permission = "NO_VIEW"
        sta_id = '0QUaMdoWE0k31'

        var sql = "insert into Rollbased(roll_id,doc_id,user_id,sta_id,isActive,permission) values(?,?,?,?,?,?)";
        connection.query(sql, [roll_id, doc_id, doc_id, sta_id, isActive, permission], (error, results) => {
          if (error) {
            return reject(error);
          }
          else {

            const doctorpassword = randomnumbers(10);
            const password = doctorpassword + process.env.PEPPER;
            let hashpassword = hashSync(password, 10)
            let verified = 0;
            var sql = "insert into signup(user_id,name,email,password,telephone,accessLevel,verified) values(?,?,?,?,?,?,?)";
            connection.query(sql, [roll_id, doctorname, email, hashpassword, phonenumber, access, verified], (error, results1) => {
              if (error) {
                return reject(error);
              }
              else {

                let user = { email, password };
                let token = jwt.sign(user, process.env.TOKENREGISTER, { expiresIn: '1day' });
                var mailOptions = {
                  from: process.env.EMAIL,
                  to: email,
                  subject: 'DOCTOR REGISTER',
                  template: 'staff',
                  context: {
                    password: doctorpassword
                  }
                };
                mailer.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    return reject(error);
                  }
                  else {

                  }
                })
                const response = {
                  message: " doctor register successfully "
                }
                return resolve(response);


              }

            })



          }

        })

      }

    })
  })
}

//----------------------------------------------admin page user register---------------------------------------//
/*
router.post('/adminuse',async (req,res)=>{
 
  try{
    if(req.session.ADMIN){
      user_id=req.session.ADMIN.user_id,
      name=req.body.name,
      email=req.body.email,
      password=randomnumbers(10),
      telephone=req.body.telephone,
      accessLevel=req.body.accessLevel || 0,
      verified=req.body.verified || 0
      

      let userdetails= await  adminUser(user_id,name,email,password,telephone,accessLevel,verified);
      res.status(200).send(userdetails);

    }
    else{
      res.status().send({message:"NOT ALLOWED"});
    }

  }
  catch(error){
    res.status(400).send(error);

  }
})

adminUser=(user_id,name,email,password,telephone,accessLevel,verified)=>{

  return new Promise((resolve,reject)=>{
    let pepperpassword=password+process.env.PEPPER;
    var sql="insert into signup(user_id,name,email,password,telephone,accessLevel,verified) values(?,?,?,?,?,?,?)";
    let hashpassword=hashSync(pepperpassword,10);
    connection.query(sql,[user_id,name,email,hashpassword,telephone,accessLevel,verified],(error,results)=>{
      if(error){
        return reject(error);
      }
      else{
        let user={email};
        let  token=jwt.sign(user,process.env.TOKENREGISTER,{expiresIn:'1day'});
        let password=password;
        var mailOptions={
          from :process.env.EMAIL,
          to:email,
          subject:'USER REGISTER',
          template:'staff',
          context:{
            password:password
          }
        };
        mailer.sendMail(mailOptions,function(error,info){
          if(error){
            return reject(error);
          }
          else{
          
          }
        })
        const response={
          message:"USER REGISTER SUCCESS"
        }
        return resolve(response);
       
      }

    })
  })
}
*/
module.exports = router;

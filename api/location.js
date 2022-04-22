let express = require('express');
let router = express.Router();
let { connection } = require('../db');
let jwt = require('jsonwebtoken');
let joi = require('joi');
require('dotenv').config();
let { mailer } = require('../transporter');
const Joi = require('joi');


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

const schema1 = Joi.object().keys({
  doctorname: Joi.string().trim().required(),
  email: Joi.string().email().required(),


  phonenumber: Joi.number().min(10).required(),
  gender: Joi.string().required(),
  access: Joi.number().required()



});

router.post('/admindoctor', async (req, res) => {
  let { error } = schema1.validate(req.body);
  if (error) {
    res.status(400).send(error);

  }
  else {



    try {


      const doc_id = randomnumbers(10),
        doctorimg = req.body.doctorimg || 'doc3.jpeg',

        doctorname = req.body.doctorname,
        email = req.body.email,
        gender = req.body.gender,
        phonenumber = req.body.phonenumber,
        access = req.body.access || 2;

      let admindoctor = await adminDoctor(doc_id, doctorimg, doctorname, email, gender, phonenumber, access);
      res.status(200).send(admindoctor);
    }
    catch (error) {

      res.status(400).send(error);

    }
  }
})


adminDoctor = (doc_id, doctorimg, doctorname, email, gender, phonenumber, access) => {
  return new Promise((resolve, reject) => {
    var sql = "insert into Doctor(doc_id,doctorimg,doctorname,email,gender,phonenumber,access) values(?,?,?,?,?,?,?)";
    let data = [doc_id, doctorimg, doctorname, email, gender, phonenumber, access];

    connection.query(sql, data, (error, results) => {
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

const schema = Joi.object().keys({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),


  telephone: Joi.number().min(10).required(),
  accessLevel: Joi.number(),
  verified: Joi.boolean(),

});
router.post('/adminuser', async (req, res) => {
  let { error } = schema.validate(req.body);
  if (error) {
    res.status(400).send(error);
  }
  else {




    try {

      user_id = randomnumbers(15),
        name = req.body.name,
        email = req.body.email,

        telephone = req.body.telephone,
        accessLevel = req.body.accessLevel || 0,
        verified = req.body.verified || 0


      let userdetails = await adminUser(user_id, name, email, telephone, accessLevel, verified);
      res.status(200).send(userdetails);



    }
    catch (error) {

      res.status(400).send(error);

    }
  }
})

adminUser = (user_id, name, email, telephone, accessLevel, verified) => {


  return new Promise((resolve, reject) => {

    let userpassword = randomnumbers(10)
    let pepperpassword = userpassword + process.env.PEPPER;

    var sql = "insert into signup(user_id,name,email,password,telephone,accessLevel,verified) values(?,?,?,?,?,?,?)";
    let hashpassword = hashSync(pepperpassword, 10);
    connection.query(sql, [user_id, name, email, hashpassword, telephone, accessLevel, verified], (error, results) => {
      if (error) {
        return reject(error);
      }
      else {

        let user = { email, userpassword };
        let token = jwt.sign(user, process.env.TOKENREGISTER, { expiresIn: '1day' });
        let password = userpassword;
        var mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: 'USER REGISTER',
          template: 'staff',
          context: {
            password: password
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
          message: "USER REGISTER SUCCESS"
        }
        return resolve(response);

      }

    })
  })
}

admindashboard = () => {
  return new Promise((resolve, reject) => {
    var sql = "select count(*) as  USERS from signup where accessLevel=0";
    connection.query(sql, (error, results) => {
      if (error) {
        return reject(error);
      }
      else {
        var sql = "select count(*) as VERIFIED  from signup where accessLevel=0 and verified=1";
        connection.query(sql, (error, results1) => {
          if (error) {
            return reject(error)

          }
          else {
            var sql = "select count(*) as PENDING from signup where accessLevel=0 and verified=0";
            connection.query(sql, (error, results2) => {
              if (error) {
                return reject(error);
              }
              else {

                let response = {
                  'USER': results[0].USERS,
                  "VERIFIED": results1[0].VERIFIED,
                  "PENDING": results2[0].PENDING
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



router.get('/admindashboard', async (req, res) => {
  try {
    let admin = await admindashboard();
    res.status(200).send(admin);

  }
  catch (error) {
    res.status(400).send(error);
  }
})

countdoctor = () => {
  return new Promise((resolve, reject) => {
    var sql = "select count(*) as DOCTORS from Doctor";
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

router.get('/admindoctorscount', async (req, res) => {
  try {
    let admindoctor = await countdoctors();
    res.status(200).send(admindoctor);

  }
  catch (error) {
    res.status(400).send(error);
  }
})

module.exports = router;

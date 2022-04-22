const express = require("express");
const router = express.Router();
const { connection } = require("../db.js");
const Joi = require("joi");
const axios = require("axios");
let { mailer } = require("../transporter");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const {
  emailvalidation,
  phonenumberuser,
} = require("../validation/signvalidation");
const { randomnumbers } = require("../randomgenerator/randomnumber");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { reject } = require("async");

let { adminuser } = require("../validation/signvalidation");

const schema = Joi.object().keys({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().trim().min(8).required(),
  telephone: Joi.number().min(10).required(),
  accessLevel: Joi.number(),
  verified: Joi.boolean(),
  doctor: Joi.boolean(),
  token: Joi.string().required(),
});

let SignUp = (
  user_id,
  name,
  email,
  password,
  telephone,
  accessLevel,
  verified
) => {
  return new Promise((resolve, reject) => {
    const salt = genSaltSync(10);
    const Hashpassword = hashSync(password, 10);
    let date = Date.now();

    var sql =
      "insert into signup(user_id,name,email,password,telephone,accessLevel,verified,signupdate) values(?,?,?,?,?,?,?,?)";
    connection.query(
      sql,
      [
        user_id,
        name,
        email,
        Hashpassword,
        telephone,
        accessLevel,
        verified,
        date,
      ],
      (error, results) => {
        if (error) {
          return reject(error);
        } else {
          if (accessLevel == 2) {
            const user = {
              email,
              password,
            };

            const token = jwt.sign(user, process.env.TOKENREGISTER, {
              expiresIn: "1day",
            });

            var mailOptions = {
              from: process.env.EMAIL,
              to: email,
              subject: "Registration",
              template: "signup",
              context: {
                token: token,
              },
            };
            mailer.sendMail(mailOptions, function (error, info) {
              if (error) {
                return reject(error);
              } else {
              }
            });
            const date = new Date();

            const response = {
              message: "Registerted success",
              alertmessage: "ADMIN WILL VERIFY",
              results: results,
              data: {
                user_id,
                name,
                email,
                accessLevel,
              },
              createdAt: date,
            };

            return resolve(response);
          }

          const user = {
            email,
            password,
          };

          const token = jwt.sign(user, process.env.TOKENREGISTER, {
            expiresIn: "1day",
          });

          var mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Registration",
            template: "signup",
            context: {
              token: token,
            },
          };
          mailer.sendMail(mailOptions, function (error, info) {
            if (error) {
              return reject(error);
            } else {
            }
          });
          const date = new Date();

          const response = {
            message: "Registerted success",
            alertmessage: "  CHECK  YOUR EMAIL AND VERIFY YOUR ACCOUNT",
            results: results,
            data: {
              user_id,
              name,
              email,
              accessLevel,
            },
            createdAt: date,
          };
          return resolve(response);
        }
      }
    );
  });
};
let insertintoDoc = (user_id, name, telephone, email) =>
  new Promise((resolve, reject) => {
    let sql = "SELECT * FROM Doctor WHERE doc_id=?";
    connection.query(sql, user_id, (error, results) => {
      if (error) {
      }
      if (results.length > 0) {
      } else {
        let signupdate = Date.now();
        let sql =
          "INSERT INTO Doctor(doc_id,doctorname,phonenumber,email,access,signupdate) VALUES(?,?,?,?,?,?)";
        connection.query(
          sql,
          [user_id, name, telephone, email, 0, signupdate],
          (error, results) => {}
        );
      }
    });
  });

router.post("/insert", emailvalidation, phonenumberuser, async (req, res) => {
  const { error } = schema.validate(req.body.payload);

  if (error) {
    return res.status(400).send(error);
  } else {
    try {
      console.log(req.body.payload);
      let token = req.body.payload.token;
      const user_id = randomnumbers(26);
      let name = req.body.payload.name;
      email = req.body.payload.email.trim();
      (password = req.body.payload.password.trim() + process.env.PEPPER),
        (telephone = req.body.payload.telephone);
      accessLevel = req.body.payload.accessLevel ?? 0;
      verified = req.body.payload.verified ?? 0;

      const sign = await SignUp(
        user_id,
        name,
        email,
        password,
        telephone,
        accessLevel,
        verified
      );

      res.status(202).send(sign);
      if (req.body.payload.doctor) {
        let results = insertintoDoc(user_id, name, telephone, email);
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }
});

router.get("/fetch", (req, res) => {
  var sql = "select * from signup where  accessLevel=0";
  connection.query(sql, (error, results) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(200).send(results);
    }
  });
});
let getuserdata = (user_id) =>
  new Promise((resolve, reject) => {
    let sql = "SELECT * FROM signup WHERE user_id=?";
    connection.query(sql, user_id, (error, results) => {
      if (error) reject(error);
      if (results) resolve(results);
    });
  });
router.get("/fetchdata/:id", async (req, res) => {
  try {
    let user_id = req.params.id;
    let results = await getuserdata(user_id);
    res.send(results).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

fetchstaffemail = (id) => {
  return new Promise((resolve, reject) => {
    var sql = "select email from Staff where sta_id=?";
    connection.query(sql, (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

fetchemail = (id) => {
  return new Promise((resolve, reject) => {
    var sql = "select  email from Doctor where doc_id=?";
    connection.query(sql, [id], (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/email", async (req, res) => {
  try {
    if (req.session.DOC) {
      const doctor = req.session.DOC.user_id;

      let fetchbyemail = await fetchemail(doctor);
      res.status(200).send(fetchbyemail);
    } else if (req.session.STAFF) {
      const staff = req.session.DOC_ID;
      let stafffetch = await fetchstaffemail(staff);
      res.status(200).send(stafffetch);
    } else {
      res.status(400).send({ message: "not allowed" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

doctorPassword = (email, oldpassword, newpassword, retypepassword) => {
  return new Promise((resolve, reject) => {
    var sql = "select  password from signup where email=?";
    connection.query(sql, [email], (error, results) => {
      if (error) {
        return reject(error);
      } else {
        let compare = compareSync(oldpassword, results[0].password);
        console.log(compare);

        if (compare) {
          if (newpassword === retypepassword) {
            const Hash = hashSync(newpassword, 10);
            let data = [Hash, email];
            var sql = "update signup set password=? where email=?";
            connection.query(sql, data, (error, results1) => {
              if (error) {
                return reject(error);
              } else {
                return resolve(results1);
              }
            });
          } else {
            return reject("MISMATCH  PASSWORD");
          }
        } else {
          return reject("OLD PASSWORD MISMATCH");
        }
      }
    });
  });
};

router.post("/changepassword", async (req, res) => {
  try {
    if (req.session.DOC) {
      const email = req.session.DOC.user,
        oldpassword = req.body.old_password + process.env.PEPPER,
        newpassword = req.body.new_password + process.env.PEPPER,
        retypepassword = req.body.retype_password + process.env.PEPPER;

      let changedoctorpassword = await doctorPassword(
        email,
        oldpassword,
        newpassword,
        retypepassword
      );
      res.status(200).send(changedoctorpassword);
    } else if (req.session.USER) {
      const email = req.session.USER.user,
        oldpassword = req.body.old_password + process.env.PEPPER,
        newpassword = req.body.new_password + process.env.PEPPER,
        retypepassword = req.body.retype_password + process.env.PEPPER;

      let changestaffpassword = await doctorPassword(
        email,
        oldpassword,
        newpassword,
        retypepassword
      );
      res.status(200).send(changestaffpassword);
    } else {
      res.status(403).send({ message: "NOT ALLOWED" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

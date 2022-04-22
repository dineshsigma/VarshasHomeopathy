const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { connection } = require("../db");
const crypto = require("crypto");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const resetemail = require("../validation/signvalidation");
const async = require("async");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { isBuffer } = require("util");

forgetpassword = (email) => {
  return new Promise((resolve, reject) => {
    var sql = "select telephone from signup where email=?";
    connection.query(sql, [email], (error, results) => {
      if (results.length > 0) {
        //const token = crypto.randomBytes(20).toString('hex');
        let user = { email: email };
        let token1 = jwt.sign(user, "cvfdfr6756554@32", {
          expiresIn: "24 hrs",
        });

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "RESET PASSWORD",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n" +
            `http://localhost:5200/#/resetpassword/reset/${token1}/${email}\n\n` +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
          } else {
            const response = { token: token1, email: email };
            return resolve(response);
          }
        });
      } else {
        return reject("mail noit found");
      }
    });
  });
};

router.post("/insert", async (req, res) => {
  try {
    let email = req.body.email;
    let forgetpass = await forgetpassword(email);
    res.status(200).send(forgetpass);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/insert1", (req, res) => {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");

          done(err, token);
        });
      },
      function (token, done) {
        const email = req.body.email;

        var sql = "select * from  signup where email=?";
        connection.query(sql, [email], (error, results1) => {
          if (results1.length == 0) {
            res.status(400).send("EMAIL NOT FOUND");
          }
          results1.resetToken = token;
          results1.resetpasswordExpires = Date.now() + 3600000;

          done(error, token, results1);
        });
      },
      function (token, results1, done) {
        let user = { email: results1[0].email };

        let token1 = jwt.sign(user, "cvfdfr6756554@32", {
          expiresIn: "24 hrs",
        });

        var smptTransport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
        });
        const mailOptions = {
          from: "gundeluguntadinesh@gmail.com",
          to: "gundeluguntadinesh@gmail.com",
          subject: "RESET PASSWORD",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n" +
            `http://localhost:5200/resetpassword/api/reset/${token1}/${results1[0].email}\n\n` +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };
        smptTransport.sendMail(mailOptions, function (error, info) {
          if (error) {
            res.status(400).send(error);
          } else {
            let response = {
              token: token1,
              email: email,
            };
            console.log(response);
            res.status(200).send("email send");
          }
        });
      },
    ],
    function (error) {
      res.status(400).send(error);
    }
  );
});

passwordupdate = (
  email,
  pepperpassword,
  confirmpassword,
  hashpassword,
  password,
  token
) => {
  return new Promise((resolve, reject) => {
    if (token) {
      jwt.verify(token, "cvfdfr6756554@32", (err, decoded) => {
        console.log(decoded == undefined);
        if (decoded == undefined) {
          return reject("TOKEN EXPIRES");
        } else {
          if (password == confirmpassword) {
            var sql = "update signup set password=? where email=?";
            connection.query(sql, [hashpassword, email], (err, results) => {
              if (err) {
                console.log("dbghjfbghjrbvhjfbv");
                console.log(error);
                return reject(err);
              } else {
                return resolve(results);
                //return resolve('RESET PASSWORD IS UPDATED SUCCESSFULLY PLEASE LOGIN')
              }
            });
          } else {
            return reject("PASSWORD AND CONFIRM PASSWORD MISMATCH");
          }
        }
      });
    }
  });
};

router.post("/reset/:token/:email", async (req, res) => {
  try {
    let email = req.params.email;
    password = req.body.password;
    pepperpassword = password + process.env.PEPPER;
    confirmpassword = req.body.confirmpassword;
    hashpassword = hashSync(pepperpassword, 10);
    token = req.params.token;

    let resetpass = await passwordupdate(
      email,
      pepperpassword,
      confirmpassword,
      hashpassword,
      password,
      token
    );
    res.status(200).send(resetpass);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }

  /*
    var sql = "select * from signup where email=?";
    connection.query(sql, [email], (error, results) => {

        if (results.length > 0) {
           

            if (password == confirmpassword) {

                var sql="update signup set password=? where email=?";
                connection.query(sql,[hashpassword,email],(err,results)=>{
                    if(err){
                        res.status(400).send(err)
                    }
                    else{
                        res.status(200).send('successfully update your password please login with reset')
                    }

                })
               

            }
            else {
                res.status(400).send('PASSWORD AND CONFIRM PASSWORD MISMATCH');
            }



        }
        else {
            res.status(400).send('email not found');
        }
    })
*/
});

passwordChange = (email, oldpassword, password, confirmpassword) => {
  return new Promise((resolve, reject) => {
    var sql = "select password from signup where email=?";
    connection.query(sql, [email], (error, results) => {
      if (results.length > 0) {
        const compare = compareSync(oldpassword, results[0].password);

        if (compare) {
          if (password == confirmpassword) {
            const salt = genSaltSync(10);
            const Hash = hashSync(password, 10);

            var sql = "update signup set password=? where email=?";
            let data = [Hash, email];
            connection.query(sql, data, (error, results) => {
              if (error) {
                return reject(error);
              } else {
                let transporter = nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                  },
                });

                var mailOptions = {
                  from: process.env.EMAIL,
                  to: email,
                  subject: "CHANGE PASSWORD",
                  html: "Hiiiii your password updated successfully",
                };
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                  } else {
                    const EMAIL = info.response;
                    const response = {
                      message: "updated successfully",
                      results: results,
                      EMAIL: EMAIL,
                    };
                    return resolve(response);
                  }
                });
              }
            });
          } else {
            return reject("PASSWWORD AND CONFIRM PASSWWORD MISMATCH");
          }
        } else {
          return reject("OLD PASSWORD MISSMATCH");
        }
      } else {
        return reject("EMAIL NOT FOUND");
      }
    });
  });
};

router.put("/changepassword", async (req, res) => {
  try {
    const email = req.body.email,
      oldpassword = req.body.oldpassword,
      password = req.body.password,
      confirmpassword = req.body.confirmpassword;

    const changepassword = await passwordChange(
      email,
      oldpassword,
      password,
      confirmpassword
    );
    res.status(200).send(changepassword);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

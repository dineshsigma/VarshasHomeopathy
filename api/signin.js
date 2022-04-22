const express = require("express");
const router = express.Router();
const { connection } = require("../db.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const axios = require("axios");
const { compareSync, hashSync } = require("bcrypt");

require("dotenv").config();

router.get("/checkdoctor", (req, res) => {
  if (req.session.DOC) {
    res.status(200).send({ message: "DOCTOR LOGGED IN" });
  } else if (req.session.DOCSTAFF) {
    res.status(200).send({ message: "DOCTOR STAFF LOGGED IN" });
  } else {
    res.status(401).send({ message: "NOT LOGGED IN" });
  }
});

router.get("/checkadmin", (req, res) => {
  if (req.session.ADMIN) {
  } else {
    res.status(401).send("ADMIN IS NOT LOGGED IN");
  }
});

router.get("/checkuser", (req, res) => {
  if (req.session.USER) {
  } else {
    res.status().send("USER IS NOT LOGGED IN");
  }
});

router.get("/logincheck", (req, res) => {
  if (req.session.DOC) {
    res.status(200).send(req.session.DOC);
  } else if (req.session.SUPER_ADMIN) {
    res.status(200).send(req.session.SUPER_ADMIN);
  } else if (req.session.ADMIN) {
    res.status(200).send(req.session.ADMIN);
  } else if (req.session.USER) {
    res.status(200).send(req.session.USER);
  } else {
    res.status(401).send({ message: "NOT LOGGED IN" });
  }
});

docLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    var sql = "select password,accessLevel,user_id from signup where email=?";
    connection.query(sql, email, (error, results) => {
      if (error) {
        return reject({ message: "unexpected error" });
      } else {
        if (results.length > 0) {
          let access_level = results[0].accessLevel;
          let user_id = results[0].user_id;

          if (results.length > 0) {
            const compare = compareSync(password, results[0].password);
            console.log(compare);
            if (compare) {
              const user = { email, password };
              const date = new Date();

              const token = jwt.sign(user, process.env.TOKENSECRET, {
                expiresIn: "1hr",
              });
              const response = {
                message: "login success",
                token: token,
                user: user.email,
                user_id: user_id,
                accessLevel: access_level,
                lastLogin: date,
              };
              let datefun = Date.now();
              var sql = "update signup set lastsignin=? where email=?";
              connection.query(sql, [datefun, email], (error, data) => {
                if (error) return reject(error);
              });
              return resolve(response);
            } else {
              return reject({ message: "invalid password" });
            }
          } else {
            return reject({ message: "No user with this email" });
          }
        } else {
          return reject({ message: "NO SUCH USERS" });
        }
      }
    });
  });
};

const schema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  token: Joi.string().required(),
});

let docidstaff = (id) =>
  new Promise((resolve, reject) => {
    let sql = "SELECT doc_id FROM Staff WHERE sta_id=?";
    connection.query(sql, id, (err, results) => {
      if (err) {
        req.session.destroy();
        reject(err);
      }
      if (results) {
        resolve(results);
      }
    });
  });

router.post("/login", async (req, res) => {
  const { error } = schema.validate(req.body.payload);

  if (error) {
    return res.status(400).send(error.message);
  } else {
    try {
      let token = req.body.payload.token;

      axios
        .post(
          `https://www.google.com/recaptcha/api/siteverify?secret=6LdvehMbAAAAACU19I33oLABwMOsgxeJn0slTIzS&response=${token}`
        )
        .then(async (res2) => {
          if (res2.data.score > 0.4) {
            const email = req.body.payload.email.trim(),
              password = req.body.payload.password.trim() + process.env.PEPPER;

            const login = await docLogin(email, password);

            if (login.accessLevel === 0) {
              req.session.USER = login;
            } else if (login.accessLevel === 1) {
              req.session.DOCSTAFF = login;
              let id = req.session.DOCSTAFF.user_id;
              let docid = await docidstaff(id);
              req.session.DOC_ID = docid[0]?.doc_id;
            } else if (login.accessLevel === 2) {
              req.session.DOC = login;
            } else if (login.accessLevel === 3) {
              req.session.ADMIN = login;
            } else if (login.accessLevel === 4) {
              req.session.SUPER_ADMIN = login;
            }

            var soc_id = req.app.get("socketid");
            var sql =
              "INSERT INTO socketid(user_id,soc_id,active,logintime,logouttime) VALUES(?,?,?,?,?)";
            time = Date.now();

            const user_id =
              req.session?.USER?.user_id ??
              req.session?.DOC_ID ??
              req.session?.DOC?.user_id ??
              req.session?.ADMIN?.user_id ??
              req.session?.SUPER_ADMIN?.user_id;

            connection.query(
              sql,
              [user_id, soc_id, 1, time, 1],
              (err, res) => {}
            );
            res
              .status(200)
              .cookie("login", login.token, {
                sameSite: true,
                httpOnly: true,
                Secure: true,
                expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
                signed: true,
                path: "/",
              })
              .send(login);
          } else {
            res.status(401).send({ message: "recaptcha verification failed" });
          }
        })
        .catch((error) => {
          console.log(error);

          res.status(401).send(error);
        });
    } catch (error) {
      res.status(400).send(error);
    }
  }
});

//--------------------------------login with otp--------------------------------//
loginwithotp = (telephone, otp) => {
  return new Promise((resolve, reject) => {
    var sql = "select otp,accessLevel,user_id from signup where telephone=?";
    connection.query(sql, [telephone], (error, results) => {
      if (error) {
        return reject("unexcepted error");
      } else {
        if (results.length > 0) {
          access_level = results[0].accessLevel;
          user_id = results[0].user_id;
        }
        if (results.length > 0) {
        }
      }
    });
  });
};
router.post("/loginwithotp", async (req, res) => {
  try {
    let token = req.body.payload.token;
    axios
      .post(
        `https://www.google.com/recaptcha/api/siteverify?secret=6LdvehMbAAAAACU19I33oLABwMOsgxeJn0slTIzS&response=${token}`
      )
      .then(async (res2) => {
        if (res2.data.score > 0.4) {
          let telephone = req.body.payload.telephone;
          otp = req.body.payload.otp;

          let sendotp = await loginwithotp(telephone, otp);
        }
      });
  } catch (error) {
    res.status(400).send(error);
  }
});

const checktoken = require("../validation/tokenvalidation");
const e = require("express");

router.post("/insert", checktoken);

router.post("/logout", function (req, res) {
  let user_id =
    req.session?.USER?.user_id ??
    req.session?.DOC?.user_id ??
    req.session?.DOC_STAFF?.user_id ??
    req.session?.ADMIN?.user_id ??
    req.session?.SUPER_ADMIN?.user_id;
  let token = req.body.token;
  req.session.destroy(function (error) {
    if (error) {
      res.status(500).send({ message: error });
    } else {
      try {
        let sql =
          "UPDATE Notification SET isActive=0 WHERE user_id=? AND token=?";
        connection.query(sql, [user_id, token], (err, res) => {});
        var soc_id = req.app.get("socketid");
        login_time = Date.now();

        if (user_id) {
          const sqls =
            "UPDATE socketid set active=0,logouttime=? where USER_ID=? and active=1";
          connection.query(sqls, [login_time, user_id], (err, res) => {});
        }

        res
          .status(200)
          .clearCookie("login")
          .send({ message: "logout successfully" });
      } catch (error) {
        res.status(400).send("eroror");
      }
    }
  });
});

module.exports = router;

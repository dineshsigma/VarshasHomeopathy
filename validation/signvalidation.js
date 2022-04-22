const express = require("express");
const router = express.Router();
const { connection } = require("../db.js");

//email validation

let emailvalidation = (req, res, next) => {
  const email = req.body.payload.email.trim();

  var sql = "select * from signup where email=?";
  connection.query(sql, [email], (error, results) => {
    if (error) {
      res.status(200).send(error);
    } else {
      if (results.length > 0) {
        res.status(400).send("EMAIL ALREADY USED:PLEASE ENTER ANOTHER EMAIL");
      } else {
        next();
      }
    }
  });
};

let staffemail = (req, res, next) => {
  let email = req.body.email.trim();
  var sql = "select * from signup where email=?";
  connection.query(sql, [email], (error, results) => {
    if (results.length > 0) {
      res.status(400).send("email is already used");
    } else {
      next();
    }
  });
};

let phonenumberuser = (req, res, next) => {
  let phone = req.body.payload.telephone;
  number = String(phone);

  console.log(number.length);
  console.log(number != 10);

  if (number.length == 10) {
    next();
  } else {
    res.status(400).send("phonenumber must be 10 number");
  }
};

let adminuser = (req, res, next) => {};

let emailbookvalidation = (req, res, next) => {
  const phonenumber = req.body.phonenumber.trim();

  var sql = "select * from bookapp  where phonenumber=?";
  connection.query(sql, [phonenumber], (error, results) => {
    if (error) {
      res.status(200).send(error);
    } else {
      if (results.length > 0) {
        res
          .status(400)
          .send("MOBILE NUMBER ALREADY USED:PLEASE ENTER ANOTHER NUMBER");
      } else {
        next();
      }
    }
  });
};

module.exports = {
  emailvalidation,
  staffemail,
  phonenumberuser,
  adminuser,
  emailbookvalidation,
};

/*
const Vonage = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: "ace6efb4",
  apiSecret: "doXoWGTgLCne3zn6",
});

const to = "918106838432";
const from = "918106838432";
const text = "heloooo DInesh";

vonage.message.sendSms(from, to, text, (err, responseData) => {
  if (err) {
    console.log(err);
  } else {
    if (responseData.messages[0]["status"] === "0") {
      console.log("Message sent successfully.");
    } else {
      console.log(
        `Message failed with error: ${responseData.messages[0]["error-text"]}`
      );
    }
  }
});
*/
/*
let API_KEY = "ace6efb4";
let API_SECRET = "doXoWGTgLCne3zn6";

// Include nexmo module
const Nexmo = require("nexmo");

const nexmo = new Nexmo({
  apiKey: "ace6efb4",
  apiSecret: "doXoWGTgLCne3zn6",
});

// Initialize with sender and reciever
// mobile number with text message
const from = "dinesh";
const to = "+916305793367";
const text = "Greetings from Geeksforgeeks";

nexmo.message.sendSms(from, to, text, function (error, result) {
  // If some error occured
  if (error) {
    console.log("ERROR", error);
  }

  // If message is sent successfully
  else {
    console.log("RESULT", result);
  }
});

/*
var Nexmo = require("nexmo");
var nexmo = new Nexmo({ apiKey: API_KEY, apiSecret: API_SECRET });

var verifyRequestId = null; // use in the check process

nexmo.verify.request({ number: TO_NUMBER, brand: APP_NAME }, function (
  err,
  result
) {
  if (err) {
    console.error(err);
  } else {
    verifyRequestId = result.request_id;
  }
});
*/
//1.https://apostle69342783.wordpress.com/manuals/?preview_id=287&preview_nonce=cd573305de&preview=true
//2.https://apostle69342783.wordpress.com/manuals2/?preview_id=333&preview_nonce=da3bf944af&preview=true
//3.https://apostle69342783.wordpress.com/create-ros-workspace/?preview_id=358&preview_nonce=aa859dadda&preview=true
//4.https://apostle69342783.wordpress.com/robot-computer/?preview_id=363&preview_nonce=46aea7efcc&preview=true
//5.https://apostle69342783.wordpress.com/install-ros1/?preview_id=387&preview_nonce=bcfc6653ff&preview=true

/*const fast2sms = require("fast-two-sms");

var options = {
  authorization: YOUR_API_KEY,
  message: "YOUR_MESSAGE_HERE",
  numbers: ["9999999999", "8888888888"],
};
//Asynchronous Function.
fast2sms.sendMessage(options).then((response) => {
  console.log(response);
});*/
/*
var fast2sms = require("fast2sms");
var options = {
  API_KEY:
    "BuExygRnXCwk3HU1imWjahMvqJbI94Z76AY5zVtd2KN0spGOLl9mwHFgeXx34bWzD7LYip5BMuPRKnGC",
};
fast2sms.init(options);
fast2sms
  .send({
    message: 'The SMS content e.g. "This is a message from Fast2SMS"',
    to: "+916305793367",
  })
  .then(function (error, data) {
    if (error) {
      console.log(err);
    } else {
      console.log(data);
    }
  });

/*
  var springedge = require('springedge');

var params = {
  'apikey': '', // API Key
  'sender': 'SEDEMO', // Sender Name
  'to': [
    '919019xxxxxxxx'  //Moblie Number
  ],
  'message': 'Hello, This is a test message from spring edge',
  'format': 'json'
};

springedge.messages.send(params, 5000, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});*/

const express = require("express");
const router = express.Router();
const { connection } = require("../db.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const axios = require("axios");
const { compareSync, hashSync, genSaltSync } = require("bcrypt");
var fast2sms = require("fast2sms");
var api = require("../node_modules/clicksend/api");

require("dotenv").config();
loginwithotp = (telephone, otp, token) => {
  return new Promise((resolve, reject) => {
    var sql =
      "select otp,accessLevel,user_id,email from signup where telephone=?";
    connection.query(sql, [telephone], (error, results) => {
      if (error) {
        return reject("unexcepted error");
      } else {
        if (results.length > 0) {
          access_level = results[0].accessLevel;
          user_id = results[0].user_id;
          if (results.length > 0) {
            const compare = compareSync(otp, results[0].otp);
            console.log(compare);
            if (compare) {
              let user = { email: results[0].email, otp };
              const date = new Date();

              const token1 = jwt.sign(user, process.env.TOKENSECRET, {
                expiresIn: "1hr",
              });
              if (token) {
                jwt.verify(token, "abcdj", (err, decoded) => {
                  if (decoded == undefined) {
                    return reject("OTP EXPIRES");
                  } else {
                    const response = {
                      message: "login success",
                      token: token1,
                      user: user.email,
                      user_id: user_id,
                      accessLevel: access_level,
                      lastLogin: date,
                    };
                    let datefun = Date.now();
                    var sql =
                      "update signup set lastsignin=? where telephone=?";
                    connection.query(
                      sql,
                      [datefun, telephone],
                      (error, data) => {
                        if (error) return reject(error);
                      }
                    );
                    return resolve(response);
                  }
                });
              }
            } else {
              return reject({ message: "INVALID OTP" });
            }
          } else {
            return reject({ message: " NO SUCH USER WITH THIS NUMBER" });
          }
        } //first if close
        else {
          return reject({ message: "NO SUCH USER" });
        }
      }
    });
  });
};

router.post("/loginwithotp", async (req, res) => {
  console.log(req.body);
  try {
    //let token = req.body.payload.token;
    //axios
    // .post(
    // `https://www.google.com/recaptcha/api/siteverify?secret=6LdvehMbAAAAACU19I33oLABwMOsgxeJn0slTIzS&response=${token}`
    //)
    //.then(async (res2) => {
    //if (res2.data.score > 0.4) {
    let telephone = req.body.telephone;
    otp = req.body.otp + process.env.PEPPER;
    token = req.body.token;

    let login = await loginwithotp(telephone, otp, token);

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
    /*} else {
          res.status(400).send({ message: " recaptcha verification failed" });
        }*/
    /*})
      .catch((error) => {
        console.log(error);
        console.log(error);

        res.status(401).send({ message: "invalid credientials" });
      });*/
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

otp = () => {
  let digits = "0123456789";
  let otp = "";
  for (var i = 0; i < 4; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

insertotp = (sendotp, telephone, otp) => {
  return new Promise((resolve, reject) => {
    const salt = genSaltSync(10);
    const Hashpassword = hashSync(sendotp, 10);
    console.log(Hashpassword);
    let user = { email: "dinesh.g@sigmasolutions.co.in", otp: otp };
    let token = jwt.sign(user, "abcdj", {
      expiresIn: "10min",
    });
    console.log(token);
    var sql = "update signup set otp=? where telephone=?";
    connection.query(sql, [Hashpassword, telephone], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        const response = {
          token: token,
          message: "OTP SEND SUCCESSFULLY",
        };
        return resolve(response);
      }
    });
  });
};

router.post("/sendotp", async (req, res) => {
  try {
    let fourdigitotp = await otp();

    sendotp = fourdigitotp + process.env.PEPPER;
    telephone = req.body.telephone;

    console.log(sendotp);

    const postotp = await insertotp(sendotp, telephone, fourdigitotp);

    var smsMessage = new api.SmsMessage();

    smsMessage.from = "+916305793367";
    smsMessage.to = "+91" + telephone;
    smsMessage.body =
      fourdigitotp +
      "  " +
      "LOGIN VERIFICATION CODE :PLEASE LOGIN WITH IN 10 MIN";
    let username = "dinesh.g@sigmasolutions.co.in";
    api_key = "0CCED215-49F1-E356-57EA-681A4F67C923";

    var smsApi = new api.SMSApi(username, api_key);

    var smsCollection = new api.SmsMessageCollection();

    smsCollection.messages = [smsMessage];

    smsApi
      .smsSendPost(smsCollection)
      .then(function (response) {
        res.status(200).send(postotp);
        //console.log(response.body);
      })
      .catch(function (err) {
        console.error(err.body);
      });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
//-------------------------------------resend otp------------------------------------//

sendingotp = (telephone, resendotp, fourdigitotp) => {
  return new Promise((resolve, reject) => {
    const salt = genSaltSync(10);
    const Hashpassword = hashSync(resendotp, 10);
    let user = { email: "dinesh.g@sigmasolutions.co.in", otp: otp };
    let token = jwt.sign(user, "abcdj", {
      expiresIn: "10min",
    });
    var sql = "update signup set otp=? where telephone=?";
    connection.query(sql, [Hashpassword, telephone], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        let response = {
          token: token,
          message: "OTP SEND SUCCESSFULLY",
        };
        return resolve(response);
      }
    });
  });
};

router.post("/resendotp", async (req, res) => {
  try {
    let telephone = req.body.telephone;
    fourdigitotp = otp();
    resendotp = fourdigitotp + process.env.PEPPER;
    console.log(fourdigitotp);

    let resend = await sendingotp(telephone, resendotp, fourdigitotp);
    var smsMessage = new api.SmsMessage();

    smsMessage.from = "+916305793367";
    smsMessage.to = "+91" + telephone;
    smsMessage.body =
      fourdigitotp +
      "  " +
      "LOGIN  VERIFICATION CODE :PLEASE LOGIN WITH IN 10 MINUTES";

    var smsApi = new api.SMSApi(
      "dinesh.g@sigmasolutions.co.in",
      "0CCED215-49F1-E356-57EA-681A4F67C923"
    );

    var smsCollection = new api.SmsMessageCollection();

    smsCollection.messages = [smsMessage];

    smsApi
      .smsSendPost(smsCollection)
      .then(function (response) {
        res.status(200).send(resend);
      })
      .catch(function (err) {
        console.error(err.body);
      });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;

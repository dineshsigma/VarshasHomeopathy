let express = require("express");
let router = express.Router();
let { connection } = require("../db");
let { randomnumbers } = require("../randomgenerator/randomnumber");
let { mailer } = require("../transporter");
require("dotenv").config();
let { emailbookvalidation } = require("../validation/signvalidation");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");

//-----------------------------------------insert Bookingappointment-----------------------------//

/*

Bookingappointment=(book_id,name,email,doctorname,doc_id,bookingdate,time,payment,paymentstatus,location)=>{
    return new Promise((resolve,reject)=>{


        var sql="select id from Booking where doc_id=?  and startAt=? and bookingdate=?";
        connection.query(sql,[doc_id,time,bookingdate],(err,idres)=>{
         console.log(idres[0].id)
         if(err){
             return reject(err)
         }
         else{
            var sql="select booked from Booking where id=?";
            connection.query(sql,[idres[0].id],(err,bookres)=>{
                console.log(bookres[0].booked)
                if(err){
                    return reject(err)
                }
                else{
                    var sql="update Booking set booked=? where id=?";
                    connection.query(sql,[bookres[0].booked+1,idres[0].id],(err,res)=>{
                       if(err){
                           return reject(err)
                       }
                       else{
                         
                            var sql="insert into BookingAppointment(book_id,name,email,doctorname,doc_id,bookingdate,time,payment,paymentstatus,location,mode) values(?,?,?,?,?,?,?,?,?,?,?)";
                            connection.query(sql,[book_id,name,email,'varsha','1aerwdfv678',bookingdate,time,payment,paymentstatus,location,mode],(err,bookingresults)=>{
                                if(err){
                                    return reject (err)

                                }
                                else{
                                    let booked="YOUR APPOINTMENT IS BOOKED SUCCESSFULLY"
                                    docname='varsha'
                                    
                                    var mailOptions={
                                        from:process.env.EMAIL,
                                        to:email,
                                        subject:'BOOKING APPOINTMENT',
                                        template:'booked',
                                        context:{
                                            booked:booked,
                                            Id:book_id,
                                            Doctorname:docname,
                                            Time:time,
                                            BookingDate:bookingdate
                                        }
                                    };
                                    mailer.sendMail(
                                        mailOptions,function(error,info){
                                            if(error){
                                                return reject(error)
                                            }
                                            else{
                    
                                            }
                                        }
                                    )
                    
                                    const response={
                                        results:bookingresults,
                                        message:'APPOINTMENT BOOKED'
                    
                    
                                    }
                                    
                                
                    
                                    return resolve(response);

                                }



                            })

                          
                           

                           
                       }

                    })
                }
            })

         }

        })
       
       

    })
}

router.post('/bookingdetails',async (req,res)=>{
    console.log(req.body)
    
    try{
        const book_id=randomnumbers(10)
        name=req.body.name
        email=req.body.email
        doctorname=req.body.doctorname
        doc_id=req.body.doc_id
        bookingdate=req.body.bookingdate
        time=req.body.time
        payment=req.body.payment
        paymentstatus=req.body.paymentstatus
        location=req.body.location ?? 0
        mode=req.body.mode


        let booking=await Bookingappointment(book_id,name,email,doctorname,doc_id,bookingdate,time,payment,paymentstatus,location,mode);
        res.status(200).send(booking)



    }
    catch(error){
        res.status(400).send(error)
    }
})

fetchalldetails=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select b.name,b.email,b.doctorname,b.doc_id,b.bookingdate,b.time,b.payment,b.paymentstatus,a.location from BookingAppointment b,address a where a.add_id=b.location"
        
        connection.query(sql,(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                var sql=" select b.name,b.email,b.doctorname,b.doc_id,b.bookingdate,b.time,b.payment,b.paymentstatus,b.mode,b.location from BookingAppointment b where  b.mode=1";
                connection.query(sql,(err,res1)=>{
                    if(err){
                        return reject(err)
                    }
                    else{
                        const response={
                            location:results,
                            mode:res1
                        }
                        return resolve(response)
                    }
                })
                
            }
        })
    })
}

router.get('/bookingdetails', async (req,res)=>{
   try{
       const fetch=await fetchalldetails();
       res.status(200).send(fetch)

   }
   catch(error){
       res.status(400).send(error)
   }

    
})



*/

appbook = (
  book_id,
  phonenumber,
  email,
  booking,
  date,
  time,
  doctorname,
  name,
  pay_id,
  paymentstatus,
  price,
  userpassword,
  hashpassword
) => {
  return new Promise((resolve, reject) => {
    if (booking == "consultation") {
      var sql = "select  * from bookapp where phonenumber=?";
      connection.query(sql, [phonenumber], (err, results) => {
        if (err) return reject(err);
        if (results.length > 0) {
          //if phonenumber ia alraedy exits
          var sql = "select pat_id from patient where phonenumber=?";
          connection.query(sql, [phonenumber], (err, pat_idresults) => {
            var sql =
              "select id from  Booking where bookingdate=? and startAt=? and doc_id=?";
            connection.query(sql, [date, time, doc_id], (err, res) => {
              var sql = "select booked from Booking where id=?";
              connection.query(sql, [res[0].id], (err, resu) => {
                var sql = "update Booking set booked=? where id=?";
                connection.query(
                  sql,
                  [resu[0].booked + 1, res[0].id],
                  (err, result) => {
                    var sql =
                      "insert into bookapp(book_id,pat_id,name,email,phonenumber,booking,date,time,doc_id,cancel) values(?,?,?,?,?,?,?,?,?,?)";
                    connection.query(
                      sql,
                      [
                        book_id,
                        pat_idresults[0].pat_id,
                        name,
                        email,
                        phonenumber,
                        booking,
                        date,
                        time,
                        doctorname,
                        0,
                      ],
                      (err, results1) => {
                        if (err) {
                          return reject(err);
                        } else {
                          let booked =
                            `Hi,\n` +
                            " Your appointment has been successfully booked. Please find the details below:";
                          docname = "varsha";
                          let signature =
                            `Regards,\n` + "Dr Varsha's Homeopathy.";
                          var mailOptions = {
                            from: process.env.EMAIL,
                            to: email,
                            subject: "APPOINTMENT SUCCESSFULLY BOOKED",
                            template: "booked",
                            context: {
                              booked: booked,
                              Id: book_id,
                              Doctorname: docname,
                              Time: time,
                              BookingDate: date,
                              // userpassword: userpassword,
                              signature: signature,
                            },
                          };
                          mailer.sendMail(mailOptions, function (error, info) {
                            if (error) {
                              return reject(error);
                            } else {
                            }
                          });
                          var sql =
                            "select telephone from signup where user_id=?";
                          connection.query(
                            sql,
                            ["1A27mYXL0px1ZNeo7GPUH6FiEc"],
                            (err, results) => {
                              let to = "whatsapp:+91" + results[0].telephone;
                              const accountid = process.env.ACCOUNTID;
                              const token = process.env.TOKENWHATSAPP;
                              const client = require("twilio")(
                                accountid,
                                token
                              );
                              client.messages.create({
                                from: "whatsapp:+14155238886",
                                body:
                                  `NEW APPOINTMENT BOOKING\n` +
                                  "Name: " +
                                  name +
                                  " " +
                                  " Date:" +
                                  " " +
                                  date +
                                  " " +
                                  "at" +
                                  " " +
                                  time,
                                to: to,
                              });
                            }
                          );

                          const response = {
                            results: results1,
                            message: "APPOINTMENT BOOKED SUCCESSFULLY",
                            pat_id: pat_idresults[0].pat_id,
                          };

                          /* var sql="select * from signup where email=?";
                                           connection.query(sql,[email],(err,results)=>{
                                               if(results.length > 0){
                                                   return resolve(response)
                                               }
                                               else{
                                                   console.log(userpassword)
                                                   var sql="insert into signup(user_id,name,email,telephone,password,accessLevel) values(?,?,?,?,?,?)";
                                                   connection.query(sql,[pat_idresults[0].pat_id,name,email,phonenumber,hashpassword,0],(err,results)=>{
                                                       console.log(err)

                                                   })
                                                   }
                                           })*/

                          return resolve(response);
                        }
                      }
                    );
                  }
                );
              });
            });
          });
        } else {
          let pat_id = randomnumbers(10);
          var sql =
            "insert into patient (pat_id,name,email,phonenumber,password,doctoradd) values(?,?,?,?,?,?)";
          connection.query(
            sql,
            [pat_id, name, email, phonenumber, hashpassword, 0],
            (err, inmsertpatient) => {
              if (err) return reject(err);
              var sql =
                "select id from Booking where bookingdate=? and startAt=? and doc_id=?";
              connection.query(sql, [date, time, doc_id], (err, res) => {
                var sql = "select  booked from Booking where id=?";
                connection.query(sql, [res[0].id], (err, resu) => {
                  var sql = "update Booking  set booked=? where id=?";
                  connection.query(
                    sql,
                    [resu[0].booked + 1, res[0].id],
                    (err, result) => {
                      var sql =
                        "insert into bookapp(book_id,pat_id,name,email,phonenumber,booking,date,time,doc_id,cancel) values(?,?,?,?,?,?,?,?,?,?)";

                      connection.query(
                        sql,
                        [
                          book_id,
                          pat_id,
                          name,
                          email,
                          phonenumber,
                          booking,
                          date,
                          time,
                          doctorname,
                          0,
                        ],
                        (err, results) => {
                          if (err) {
                            return reject(err);
                          } else {
                            let booked =
                              `Hi,\n` +
                              " Your appointment has been successfully booked. Please find the details below:";
                            doctorname = "varsha";
                            let signature =
                              `Regards,\n` + "Dr Varsha's Homeopathy.";
                            docname = "Dr. Varsha";

                            var mailOptions = {
                              from: process.env.EMAIL,
                              to: email,
                              subject: "BOOKING APPOINTMENT",
                              template: "booked",
                              context: {
                                booked: booked,
                                Id: book_id,
                                doctorname: docname,
                                Time: time,
                                BookingDate: date,
                                // userpassword: userpassword,
                                signature: signature,
                              },
                            };
                            mailer.sendMail(mailOptions, function (
                              error,
                              info
                            ) {
                              if (error) {
                                return reject(error);
                              } else {
                                console.log(info);
                              }
                            });
                            var sql =
                              "select telephone from signup where user_id=?";
                            connection.query(
                              sql,
                              ["1A27mYXL0px1ZNeo7GPUH6FiEc"],
                              (err, results) => {
                                let to = "whatsapp:+91" + results[0].telephone;
                                const accountid = process.env.ACCOUNTID;
                                const token = process.env.TOKENWHATSAPP;
                                const client = require("twilio")(
                                  accountid,
                                  token
                                );
                                client.messages.create({
                                  from: "whatsapp:+14155238886",
                                  body:
                                    `NEW APPOINTMENT UPDATE\n` +
                                    "Name: " +
                                    name +
                                    " " +
                                    " Slot Booked:" +
                                    " " +
                                    date +
                                    " " +
                                    "at" +
                                    " " +
                                    time,
                                  to: to,
                                });
                              }
                            );

                            const response = {
                              results: results,
                              message: "APPOINTMENT IS SUCCESSS",
                              pat_id: pat_id,
                            };

                            /*  var sql="select * from signup where email=?";
                                    connection.query(sql,[email],(err,results)=>{
                                        if(results.length > 0){
                                            return resolve(response)
                                        }
                                        else{
                                            console.log(userpassword)
                                            var sql="insert into signup(user_id,name,email,telephone,password,accessLevel) values(?,?,?,?,?,?)";
                                            connection.query(sql,[pat_id,name,email,phonenumber,hashpassword,0],(err,results)=>{
                                                console.log(err)

                                            })
                                            }
                                    })*/

                            return resolve(response);
                          } //else close
                        }
                      ); //insert booking table
                    }
                  ); //update booked
                }); //fetch booked value
              }); //fetch id from booking
            }
          ); //insert patient
        } //else
      }); //select phone number
    } //close if
  });
};
let axios = require("axios");
router.post("/bookingdetails", async (req, res) => {
  try {
    let book_id = randomnumbers(10);
    phonenumber = req.body.phonenumber;
    email = req.body.email.trim();
    name = req.body.name;
    booking = req.body.booking;
    date = req.body.date.split("T")[0];
    time = req.body.time;
    doctorname = "1A27mYXL0px1ZNeo7GPUH6FiEc";
    pay_id = req.body.pay_id;
    paymentstatus = req.body.paymentstatus;
    price = req.body.price;
    doc_id = "1A27mYXL0px1ZNeo7GPUH6FiEc";
    userpassword = randomnumbers(10);
    pepperpassword = userpassword + process.env.PEPPER;
    hashpassword = hashSync(pepperpassword, 10);

    const uppercaseWords = (str) =>
      str.replace(/^(.)|\s+(.)/g, (c) => c.toUpperCase());
    username = uppercaseWords(req.body.name);

    const insertbook = await appbook(
      book_id,
      phonenumber,
      email,
      booking,
      date,
      time,
      doctorname,
      username,
      pay_id,
      paymentstatus,
      price,
      userpassword,
      hashpassword
    );
    //res.status(200).send(insertbook)

    res
      .status(200)
      .cookie("bookingdetails", insertbook.auth, {
        httpOnly: true,
        sameSite: true,
        path: "/",
        Secure: true,
        signed: true,
        expires: new Date(new Date().getTime() + 1000 * 45 * 60),
      })
      .send([insertbook]);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

fetchbookingvalues = (doc_id) => {
  return new Promise((resolve, reject) => {
    //var sql="select * from bookapp";
    var sql =
      "select b.book_id,b.name,b.email,b.pat_id,b.time,b.doc_id,DATE_FORMAT(date,'%Y-%m-%d') as date,b.phonenumber,s.name as doctorname from bookapp b,signup s where b.doc_id=s.user_id  and b.cancel=0 ";
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(result);
      }
    });
  });
};

router.get("/bookingdetails", async (req, res) => {
  try {
    if (req.session.DOC) {
      let doc_id = req.session.DOC.user_id;
      const fetchbook = await fetchbookingvalues(doc_id);
      res.status(200).send(fetchbook);
    } else {
      res.status(400).send("NOT ALLOWED");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
let Razorpay = require("razorpay");
buymed = (
  buy_medid,
  phonenumber,
  email,
  name,
  booking,
  pay_id,
  paymentstatus,
  price,
  date,
  time,
  doc_id
) => {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into buymed(buy_medid,phonenumber,email,name,booking,pay_id,paymentstatus,price,date,time,doc_id) values(?,?,?,?,?,?,?,?,?,?,?)";
    connection.query(
      sql,
      [
        buy_medid,
        phonenumber,
        email,
        name,
        booking,
        pay_id,
        paymentstatus,
        price,
        date,
        time,
        doc_id,
      ],
      (err, results) => {
        if (err) {
          return reject(err);
        } else {
          var instance = new Razorpay({
            key_id: "rzp_live_DOy0OFFCZq2tpA",
            key_secret: "KAIeYzEMMsKRakfPWuYfebaJ",
          });
          let options = {
            amount: price,
            pay_id: pay_id,
            currency: "INR",
          };
          // console.log(instance.orders.create);
          let res = instance.payments.capture(pay_id, price * 100, "INR");

          let sql = "select telephone from signup where user_id=?";
          connection.query(sql, [doc_id], (err, results) => {
            let message1 =
              `Hi,\n\n` +
              "Thank you for ordering the medicines. Your payment has been successfully received.\n Please find the details below.";

            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
              },
            });
            console.log("email" + email);
            const mailOptions = {
              from: process.env.EMAIL,
              to: email,
              subject: "MEDICINES ORDER SUCCESSFULLY PLACED",
              text:
                `Hi,\n\n` +
                "Thank you for ordering the medicines. Your payment has been successfully received.\n Please find the details below.\n" +
                "Payment Reference ID: " +
                pay_id +
                "\n Payment done at: " +
                date +
                "\t" +
                time +
                "\n Amount Paid: " +
                price +
                "\n\n" +
                "Thank you. \n\n Dr Varsha's Homeopathy",
            };

            transporter.sendMail(mailOptions, function (error, info) {
              console.log("bfshdhjrbv");
              console.log(mailOptions);
              if (error) {
                console.log(error);
              }
              console.log("bfhadvhjdsvhjdsv sd");
              console.log(info);
            });

            /*var mailOptions = {
              from: process.env.EMAIL,
              to: email,
              subject: "MEDICINES ORDER SUCCESSFULLY PLACED",
              text:
                `Hi,\n\n` +
                "Thank you for ordering the medicines. Your payment has been successfully received.\n Please find the details below.\n" +
                "Payment Reference ID: " +
                pay_id +
                "\n Payment done at: " +
                date +
                "\t" +
                time +
                "\n Amount Paid: " +
                price +
                "\n\n" +
                "Thank you. \n\n Dr Varsha's Homeopathy",
            };
            mailer.sendMail(mailOptions, function (error, info) {
              console.log(mailOptions);
              if (error) throw error;
            });*/
            console.log(results[0].telephone);
            const accountid = process.env.ACCOUNTID;
            const token = process.env.TOKENWHATSAPP;
            const client = require("twilio")(accountid, token);
            let to = "whatsapp:+91" + results[0].telephone;

            client.messages.create({
              from: "whatsapp:+14155238886",
              body:
                `NEW PAYMENT UPDATE: \n` +
                " Name: " +
                name +
                "Date Of Payment: " +
                date +
                " " +
                "at" +
                " " +
                time +
                " " +
                "Amount Paid:" +
                price,
              to: "whatsapp:+91" + results[0].telephone,
            });

            return resolve(results);
          });
        }
      }
    );
  });
};
let moment = require("moment");
router.post("/buymedicines", async (req, res) => {
  var time = new Date();

  const currenttime = time.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    seconds: "numeric",
    hour12: true,
  });
  console.log(currenttime);

  //$2b$10$XX0SWvc2hTkQJaZMk2wPZuxQfOpLh2xXWKfjJcowNpBZh4O.LqRk6

  let date_ob = new Date();
  let date1 = ("0" + date_ob.getDate()).slice(-2);

  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  let year = date_ob.getFullYear();

  const date = year + "-" + month + "-" + date1;

  //var dt = moment(currenttime, ["h:mm:ss A"]).format("HH:mm:ss");
  //let dt = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();

  try {
    let buy_medid = randomnumbers(10);
    phonenumber = req.body.phonenumber;
    email = req.body.email;
    name = req.body.name;
    booking = req.body.booking;
    pay_id = req.body.pay_id;
    paymentstatus = req.body.paymentstatus;
    price = req.body.price;
    doc_id = "1A27mYXL0px1ZNeo7GPUH6FiEc";

    const insmed = await buymed(
      buy_medid,
      phonenumber,
      email,
      name,
      booking,
      pay_id,
      paymentstatus,
      price,
      date,
      currenttime,
      doc_id
    );
    res.status(200).send(insmed);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
let crypto = require("crypto");
router.post("/verification", (req, res) => {
  console.log(req.body);
  try {
    let secret = "varshasrazorpay";
    let shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    let digest = shasum.digest("hex");
    console.log(digest, req.headers["x-razorpay-signature"]);
    if (digest === req.headers["x-razorpay-signature"]) {
      res.status(200).send("success");
    } else {
      res.status(400).send("fail");
    }
  } catch (error) {
    console.log(error);
  }
});
fetchmed = () => {
  return new Promise((resolve, reject) => {
    var sql =
      "select buy_medid,name,email,phonenumber,booking,pay_id,paymentstatus,price,time,DATE_FORMAT(date, '%Y-%m-%d') as bookingdate from buymed";
    connection.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/buymedicines", async (req, res) => {
  try {
    const fetch = await fetchmed();
    res.status(200).send(fetch);
  } catch (error) {
    res.status(400).send(error);
  }
});

//--------------------------------------fetch booking appointment by id---------------------//

userdetails = (phonenumber) => {
  return new Promise((resolve, reject) => {
    var sql =
      "select book_id,name,email,booking,time,doctorname,DATE_FORMAT(date, '%Y-%m-%d') as date from bookapp where phonenumber=?";
    connection.query(sql, [phonenumber], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/userdetails/:id", async (req, res) => {
  try {
    let phonenumber = req.params.id;

    const getuser = await userdetails(phonenumber);
    res.status(200).send(getuser);
  } catch (error) {
    res.status(400).send(error);
  }
});

BookUpdate = (
  book_id,
  phonenumber,
  name,
  email,
  booked,
  date,
  time,
  doctorname
) => {
  return new Promise((resolve, reject) => {
    var sql =
      "select  DATE_FORMAT(date, '%Y-%m-%d') as date,time from bookapp where book_id=?";
    connection.query(sql, [book_id], (err, results1) => {
      let doc_id = "1A27mYXL0px1ZNeo7GPUH6FiEc";
      console.log(results1[0].date, results1[0].time);
      var sql =
        "select id from Booking where bookingdate=? and startAt=? and doc_id=?";
      connection.query(
        sql,
        [results1[0].date, results1[0].time, doc_id],
        (err, results2) => {
          var sql = "select  booked from Booking where id=?";
          connection.query(sql, [results2[0].id], (err, results3) => {
            var sql = "update Booking set booked=? where id=?";
            connection.query(
              sql,
              [results3[0].booked - 1, results2[0].id],
              (err, results4) => {
                var sql =
                  "select id,booked from Booking where bookingdate=? and startAt=? and doc_id=? ";
                connection.query(sql, [date, time, doc_id], (err, results5) => {
                  var sql = "update Booking set booked=? where id=?";
                  connection.query(
                    sql,
                    [results5[0].booked + 1, results5[0].id],
                    (err, results6) => {
                      var sql =
                        "update bookapp set phonenumber=?,name=?,email=?,date=?,time=?,doctorname=? where book_id=?";
                      connection.query(
                        sql,
                        [
                          phonenumber,
                          name,
                          email,
                          date,
                          time,
                          doctorname,
                          book_id,
                        ],
                        (err, results7) => {
                          if (err) {
                            return reject(err);
                          } else {
                            return resolve(results7);
                          }
                        }
                      );
                    }
                  );
                });
              }
            );
          });
        }
      );
    });
  });
};

router.put("/userdetails/:id", async (req, res) => {
  try {
    let book_id = req.params.id;
    phonenumber = req.body.phonenumber;
    name = req.body.name;
    email = req.body.email;
    booked = req.body.booked;
    date = req.body.date;
    time = req.body.time;
    doctorname = "varsha";

    const updatebooking = await BookUpdate(
      book_id,
      phonenumber,
      name,
      email,
      booked,
      date,
      time,
      doctorname
    );
    res.status(200).send(updatebooking);
  } catch (error) {
    res.status(400).send(error);
  }
});

usercreate = (id, phonenumber, email, name) => {
  return new Promise((resolve, reject) => {
    var sql = "select phonenumber  from bookapp where phonenumber=?";
    connection.query(sql, [phonenumber], (err, results) => {
      console.log(results.length);
      if (err) {
        return reject(err);
      }
      if (results.length > 0) {
        var sql = "select pat_id from patient where phonenumber=? ";
        connection.query(sql, [phonenumber], (err, results) => {
          var sql =
            "insert into bookapp(book_id,name,email,phonenumber) values(?,?,?,?)";
          connection.query(
            sql,
            [id, name, email, phonenumber],
            (err, results) => {}
          );
        });
      } else {
        let pat_id = randomnumbers(10);
        console.log(pat_id, name, email, phonenumber);
        var sql =
          "insert into patient(id,name,email,phonenumber) values(?,?,?,?)";
        connection.query(
          sql,
          [pat_id, name, email, phonenumber],
          (err, results) => {
            var sql =
              "insert into bookapp(book_id,name,email,phonenumber) values(?,?,?,?)";
            connection.query(
              sql,
              [id, name, email, phonenumber],
              (err, results) => {}
            );
          }
        );
      }
    });
  });
};

router.post("/bookingdetailscreate", async (req, res) => {
  try {
    let id = randomnumbers(10);
    phonenumber = req.body.phonenumber;

    email = req.body.email;
    name = req.body.name;

    const user = await usercreate(id, phonenumber, email, name);
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

fetchallpatients = () => {
  return new Promise((resolve, reject) => {
    var sql =
      "select pat_id,name,email,phonenumber from patient  where doctoradd=0";
    connection.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};
router.get("/patientfetch", async (req, res) => {
  try {
    const fetchpat = await fetchallpatients();
    res.status(200).send(fetchpat);
  } catch (error) {
    res.status(400).send(error);
  }
});

doctorpatientsget = () => {
  return new Promise((resolve, reject) => {
    var sql =
      "select pat_id,name,email,password,phonenumber from  patient where doctoradd=1";
    connection.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/fetchdoctorpatients", async (req, res) => {
  try {
    let getdoctorpat = await doctorpatientsget();
    res.status(200).send(getdoctorpat);
  } catch (error) {
    res.status(400).send(error);
  }
});

gettodayapp = (date, doc_id) => {
  return new Promise((resolve, reject) => {
    var sql =
      "select name,email,phonenumber,time,pat_id,book_id  from bookapp  where date=? and doc_id=? and cancel=0";
    connection.query(sql, [date, doc_id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/todayappointment", async (req, res) => {
  let date_ob = new Date();
  let date1 = ("0" + date_ob.getDate()).slice(-2);

  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  let year = date_ob.getFullYear();

  const date = year + "-" + month + "-" + date1;

  try {
    if (req.session.DOC) {
      let doc_id = req.session.DOC.user_id;

      const todayapp = await gettodayapp(date, doc_id);
      res.status(200).send(todayapp);
    } else {
      res.status(400).send("NOT ALLOWED");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

latestmed = (doc_id) => {
  return new Promise((resolve, reject) => {
    //var sql="select * from bookapp  order by date   limit 2";
    var sql =
      "select name,phonenumber,email,pay_id,paymentstatus,time,DATE_FORMAT(date,'%Y-%m-%d')   as date from buymed  where doc_id=?  order by date desc limit 10 ";
    connection.query(sql, [doc_id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/recentmedicines", async (req, res) => {
  try {
    if (req.session.DOC) {
      let doc_id = req.session.DOC.user_id;

      const getlatest = await latestmed(doc_id);
      res.status(200).send(getlatest);
    } else {
      res.status(400).send("not allowed");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.get("/twiliomessage", (req, res) => {
  try {
    let response = {
      whatsapp: "whatsapp:+14155238886",
      joinmessage: "join applied-fall",
    };

    res.status(200).send(response);
  } catch (error) {
    res.status(400).send(error);
  }
});
//---------------------------------post days  for buy medicines-------------------------//
postdays = (days) => {
  return new Promise((resolve, reject) => {
    var sql = "insert into medicine_course(medicine_course) values(?)";
    connection.query(sql, [days], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.post("/insertdays", async (req, res) => {
  try {
    let days = req.body.medicine_course;

    let insertdays = await postdays(days);
    res.status(200).send(insertdays);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
//-----------------------fetch days for buy medicines----------------------------//
noofdays = () => {
  return new Promise((resolve, reject) => {
    var sql = "select * from medicine_course";
    connection.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};
router.get("/fetchdays", async (req, res) => {
  try {
    let fetchdays = await noofdays();
    res.status(200).send(fetchdays);
  } catch (error) {
    res.status(400).send(error);
  }
});
//--------------------------------buy medicines for update days---------------------------------------//
putdays = (days, id) => {
  return new Promise((resolve, reject) => {
    var sql = "update medicine_course set medicine_course=? where id=?";
    connection.query(sql, [days, id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};
router.put("/updatedays/:id", async (req, res) => {
  try {
    let medicine_course = req.body.medicine_course;
    id = req.params.id;

    let updatedays = await putdays(medicine_course, id);
    res.status(200).send(updatedays);
  } catch (error) {
    res.status(400).send(error);
  }
});
module.exports = router;

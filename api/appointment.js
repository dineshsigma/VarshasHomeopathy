const { reject } = require("async");
const express = require("express");
const Joi = require("joi");
let { randomnumbers } = require("../randomgenerator/randomnumber");
let router = express.Router();
let { connection } = require("../db.js");
let { mailer } = require("../transporter");

appointFetch = () => {
  return new Promise((resolve, reject) => {
    // var sql="select a.name,a.number,s.email,a.number,a.time,c.chambarname,a.status from Chambar c ,Appointment a,signup s where s.user_id=a.email and c.cha_id=a.chambarname";
    // var sql = "select a.app_id,a.name,a.email,a.phonenumber,a.time,c.cha_id,a.status,s.user_id from Chambar c,Appointment a,signup s where s.user_id=a.user_id and c.cha_id=a.cha_id";
    //var sql="select  a.name,a.phonenumber,a.time,a.status,p.user_id,c.chambarname from Chambar c,Appointment a,Patient p where p.pat_id=a.user_id and c.cha_id=a.chambarname";

    var sql =
      "select  a.app_id,a.name,a.user_id,a.phonenumber,a.time,a.status,p.email,c.chambarname from Chambar c,Patient p, Appointment a where c.cha_id=a.chambarname and a.user_id=p.pat_id";
    connection.query(sql, (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};
let fetchforbooking = (doc_id, date) =>
  new Promise((resolve, reject) => {
    let sql = "SELECT * FROM Doctorschedule WHERE doc_id=? AND date =?";
    // var sql = "select startAt ,endAt ,date,mode,cha_id from Doctorschedule where doc_id=? AND date=?";
    connection.query(sql, [doc_id, date], (results, error) => {
      if (error) return reject(error);
      if (results) return resolve(results);
    });
  });
router.post("/get", async (req, res) => {
  try {
    doc_id = req.body.id;
    date = req.body.date;
    let results = await fetchforbooking(doc_id, date);
    res.send(results).status(200);
  } catch (error) {
    res.send(error).status(500);
  }
});
router.get("/fetch", async (req, res) => {
  try {
    const fetapp = await appointFetch();
    res.status(200).send(fetapp);
  } catch (error) {
    res.status(400).send(error);
  }
});
let fetchschedulebydoc = (id) =>
  new Promise((resolve, reject) => {
    let sql = "select * from Doctorschedule WHERE doc_id=?";
    connection.query(sql, id, (err, res) => {
      if (err) reject(err);
      if (res) resolve(res);
    });
  });
router.get("/doc_id/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let results = await fetchschedulebydoc(id);
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send(results);
  }
});

fetchAppById = (app_id) => {
  return new Promise((resolve, rejcet) => {
    var sql = "select * from Appointment where app_id=?";
    // var sql = "select  a.chambarname,a.name,a.phonenumber,a.status,a.time,a.user_id,p.email from Appointment a ,Patient p where a.user_id=p.pat_id and  a.app_id=?";
    connection.query(sql, [app_id], (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/fetch/:app_id", async (req, res) => {
  try {
    const app_id = req.params.app_id;

    let fetchapp = await fetchAppById(app_id);
    res.status(200).send(fetchapp);
  } catch (error) {
    res.status(400).send(error);
  }
});

appDel = (app_id) => {
  return new Promise((resolve, reject) => {
    var sql = "delete from Appointment where app_id=?";
    connection.query(sql, [app_id], (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};
router.delete("/delete/:app_id", async (req, res) => {
  try {
    let app_id = req.params.app_id;
    let delapp = await appDel(app_id);
    res.status(200).send(delapp);
  } catch (error) {
    res.status(400).send(error);
  }
});

appointmentInsert = (
  app_id,
  name,
  user_id,
  phonenumber,
  time,
  chambarname,
  status
) => {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into Appointment(app_id,user_id,name,phonenumber,time,chambarname,status) values(?,?,?,?,?,?,?)";
    let data = [app_id, user_id, name, phonenumber, time, chambarname, status];

    connection.query(sql, data, (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

const schema = Joi.object().keys({
  app_id: Joi.number(),
  USER_id: Joi.string(),
  NAME: Joi.string().required(),
  //EMAIL: Joi.string(),
  NUMBER: Joi.number().required(),
  TIME: Joi.string().required(),
  CHAMBER: Joi.string().required(),
  STATUS: Joi.number(),
});

router.post("/insert", async (req, res) => {
  let { error } = schema.validate(req.body);
  if (error) {
    res.status(400).send(error);
  }
  try {
    const app_id = randomnumbers(20);
    user_id = req.body.USER_id;
    let name = req.body.NAME;
    phonenumber = req.body.NUMBER;
    time = req.body.TIME;
    chambarname = req.body.CHAMBER;
    let status = req.body.STATUS || 0;
    //user_id = req.params.user_id

    let insapp = await appointmentInsert(
      app_id,
      name,
      user_id,
      phonenumber,
      time,
      chambarname,
      status
    );
    res.status(200).send(insapp);
  } catch (error) {
    //res.status(400).send({ message: "error occured" });
  }
});

StaffUpdate = (
  app_id,
  user_id,
  name,
  phonenumber,
  time,
  chambarname,
  status
) => {
  return new Promise((resolve, reject) => {
    var sql =
      "update Appointment set user_id=?,name=?,phonenumber=?,time=?,chambarname=?,status=? where app_id=?";
    let data = [user_id, name, phonenumber, time, chambarname, status, app_id];

    connection.query(sql, data, (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

const schema1 = Joi.object().keys({
  app_id: Joi.string(),
  name: Joi.string(),
  email: Joi.string(),
  user_id: Joi.string(),
  number: Joi.number(),
  time: Joi.string(),
  chambarname: Joi.number(),
  status: Joi.number(),
});

router.put("/update", async (req, res) => {
  let { error } = schema1.validate(req.body);
  if (error) {
    return res.status(400).send(error);
  }
  //else {

  try {
    let app_id = req.body.app_id;
    user_id = req.body.email;
    let name = req.body.name;
    phonenumber = req.body.number;
    time = req.body.time;
    chambarname = req.body.chambarname;
    let status = req.body.status;
    let updatestaff = await StaffUpdate(
      app_id,
      user_id,
      name,
      phonenumber,
      time,
      chambarname,
      status
    );
    res.status(200).send(updatestaff);
  } catch (error) {
    res.status(400).send(error);
  }
  //}
});

schedulebyid = (doc_id) => {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM Doctorschedule where sch_id =? ";
    connection.query(sql, doc_id, (error, results) => {
      if (results) resolve(results);
    });
  });
};

router.get("/schedule/:id/:id", async (req, res) => {
  try {
    let doc_id = req.params.id;
    let results = await schedulebyid(doc_id);
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/schedules/:id", async (req, res) => {
  let DOC_ID = req.params.id;

  //let sql = "SELECT d.sch_id,d.doc_id,d.date,d.startAT,d.endAt,d.mode,d.timePerPatient FROM Doctorschedule d,Booking b  where  b.booked=1 and b.sch_id=d.sch_id and d.doc_id = ? "
  //let sql = "SELECT   d.sch_id,d.doc_id,d.date,d.startAT,d.endAt,d.mode,d.timePerPatient,b.booked,b.sch_id,b.doc_id  from  Doctorschedule d,Booking b where doc_id = ?"
  let sql =
    "select d.sch_id,d.doc_id,d.date,d.startAT,d.mode,d.location,a.location from Doctorschedule d ,address a  where a.add_id=d.location  and d.doc_id=?";
  //let sql = "select d.sch_id,d.doc_id,d.date,d.startAT,d.endAt,d.mode,d.timePerPatient,b.doc_id,b.startAt,b.endAt from Doctorschedule d ,Booking b  where  d.doc_id=?"
  // var sql="select date_format(startAt,'%H:%i') as startAt,date_format(endAt,'%H:%i')  as endTime,date,mode,cha_id from Doctorschedule where doc_id=?;"
  //var sql="select d.sch_id,d.doc_id,d.date,d.startAT,d.mode,d.location,a.location from Doctorschedule d  ,address a where a.add_id=d.location and d.doc_id=?";
  connection.query(sql, [DOC_ID], (err, result) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(result);
    }
  });
});

insertSchedule = (
  sch_id,
  doc_id,
  date,
  location,
  mode,
  startAt,
  arrstartat
) => {
  return new Promise((resolve, reject) => {
    let slots = startAt.replace(/['"]+/g, "");
    var sql = "select   *  from Doctorschedule  where date=?";
    connection.query(sql, [date], (err, results) => {
      if (results.length > 0) {
        return reject({
          message: "SCHEDULE IS ALREADY EXITS FOR THIS DATE" + date,
        });
      } else {
        var sql =
          "insert into Doctorschedule(sch_id,doc_id,date,location,mode,startAt) values (?,?,?,?,?,?)";
        connection.query(
          sql,
          [sch_id, doc_id, date, location, mode, slots],
          (err, results) => {
            if (err) {
              return reject(err);
            } else {
              for (var i = 0; i < arrstartat.length; i++) {
                var sql =
                  "insert into Booking (sch_id,startAt,bookingdate,doc_id,booked,mode,cha_id) values(?,?,?,?,?,?,?)";
                connection.query(
                  sql,
                  [sch_id, arrstartat[i], date, doc_id, 0, mode, location],
                  (err, bookresults) => {
                    if (err) {
                      return reject(err);
                    } else {
                      return resolve(bookresults);
                    }
                    //return resolve(bookresults);
                  }
                );
              }
              //return resolve(results);
            }
          }
        );
      }
    });
  });
};
let slotinsert = (result) =>
  new Promise((resolve, reject) => {
    for (var i = 0; i < result.length; i++) {
      let sql = "INSERT INTO Booking SET ?";
      connection.query(sql, result[i], (error, results) => {
        if (error) {
          return reject(error);
        } else {
          return resolve("success");
        }
      });
    }
  });

router.post("/schedule/set/:id", async (req, res) => {
  let doctor_id = req.params.id;

  try {
    sch_id = randomnumbers(13);
    doc_id = doctor_id;
    date = req.body.data.date.split("T")[0];
    startAt = req.body.data.startAt;
    location = req.body.data.location;
    let arrstartat = req.body.data.startAt;

    mode = req.body.data.mode || 0;

    var stringObj = JSON.stringify(startAt);

    let fetchsed = await insertSchedule(
      sch_id,
      doc_id,
      date,
      location,
      mode,
      stringObj,
      arrstartat
    );
    res.status(200).send(fetchsed);
    //console.log(output.length);
    /*let result = [];
    for (var i = 0; i < output.length; i++) {
      let date1 = output[i].date;
      //console.log(output[i].date);
      //console.log(output[i].startAt.length);
      for (var j = 0; j < output[i].startAt.length; j++) {
        console.log(output[i].startAt[j]);
        var sql = "insert into Booking (startAt,bookingdate) values(?,?)";
        connection.query(
          sql,
          [output[i].startAt[j], date1],
          (err, results) => {}
        );
      }
    }
    let slot = await slotinsert(result);*/
    /*let status = 0;
    let bookingdate = date;
    let slotlen = startAt.length;
    let result = [];

    for (var i = 0; i < slotlen; i++) {
      result.push({
        startAt: startAt[i],
        doc_id: doc_id,
        sch_id: sch_id,
        booked: 0,
        status: 0,
        bookingdate: date,
        mode: mode,
        cha_id: location,
      });

      //console.log(result);
    }

    //console.log(result.length);
    ///let slot = await slotinsert(result);

    //console.log(result);
    //console.log(result.length);

    /*
    var slotConfig = {
      "configSlotHours": "00",
      "configSlotMinutes": timePerPatient,
      "configSlotPreparation": gap,
      "timeArr": [
        { "startTime": startAt.slice(0, 5), "endTime": endAt.slice(0, 5) },
      ]
    }

    function createSlots(slotConfig) {
      console.log("ahbfchjsbdfvhgdsv")
      console.log(slotConfig)
      const { configSlotHours, configSlotMinutes, configSlotPreparation, timeArr } = slotConfig;


      let defaultDate = new Date().toISOString().substring(0, 10)
      let slotsArray = []
      let _timeArrStartTime;
      let _timeArrEndTime;
      let _tempSlotStartTime;
      let _endSlot;
      let _startSlot;
      for (var i = 0; i < timeArr.length; i++) {
        _timeArrStartTime = (new Date(defaultDate + " " + timeArr[i].startTime)).getTime();
        _timeArrEndTime = (new Date(defaultDate + " " + timeArr[i].endTime)).getTime();
        _tempSlotStartTime = _timeArrStartTime;
        while ((new Date(_tempSlotStartTime)).getTime() < (new Date(_timeArrEndTime)).getTime()) {
          _endSlot = new Date(_tempSlotStartTime);
          _startSlot = new Date(_tempSlotStartTime);
          _tempSlotStartTime = _endSlot.setHours(parseInt(_endSlot.getHours()) + parseInt(configSlotHours));
          _tempSlotStartTime = _endSlot.setMinutes(parseInt(_endSlot.getMinutes()) + parseInt(configSlotMinutes));
          if (((new Date(_tempSlotStartTime)).getTime() <= (new Date(_timeArrEndTime)).getTime())) {
            slotsArray.push({
              "timeSlotStart": new Date(_startSlot).toLocaleTimeString('en-IN', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              }),
              "timeSlotEnd": _endSlot.toLocaleTimeString('en-IN', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              })
            })
          }
          _tempSlotStartTime = _endSlot.setMinutes(_endSlot.getMinutes() + parseInt(configSlotPreparation));
        }
      }
      return slotsArray;
    }
    let array = createSlots(slotConfig)
    let result = []
    let status = 0
    let bookingdate = Date.now();
   
    array.forEach((results) => {
      result.push({ "startAt": results.timeSlotStart, "endAt": results.timeSlotEnd, "sch_id": sch_id, "cha_id": cha_id, "doc_id": doc_id, "mode": mode, "status": status, "bookingdate": bookingdate, "price": price })
    })
    console.log(result)
    let slot = await slotinsert(result)*/
  } catch (error) {
    console.log(error);

    res.status(400).send(error);
  }
});
let getSlots = (doc_id, sch_id) =>
  new Promise((resolve, reject) => {
    // let sql = "SELECT * FROM Booking WHERE sch_id =?  AND booked=0 or booked=1  or booked=2"
    let sql = "select * from Booking where sch_id=?  and booked!=1 ";
    connection.query(sql, [sch_id], (error, result) => {
      if (error) reject(error);
      if (result) {
        resolve(result);
      }
    });
  });
router.get("/slot/:doc_id/:sch_id", async (req, res) => {
  console.log(req.params.sch_id);

  try {
    let doc_id = req.params.doc_id;
    let sch_id = req.params.sch_id;
    let result = await getSlots(doc_id, sch_id);
    res.send(result).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});
let bookappoi = (
  time,
  USER_ID,
  bookingdate,
  sender_id,
  payment,
  payment_ref_id
) =>
  new Promise((resolve, reject) => {
    var sql1 = "select booked from Booking where id=?";
    connection.query(sql1, [time], (err, results) => {
      console.log(results[0].booked);

      let sql =
        "UPDATE Booking SET booked=?, user_id=?,bookingdate=?,payment_status=?,payment_ref_id=? WHERE id =?";
      connection.query(
        sql,
        [
          results[0].booked + 1,
          USER_ID,
          bookingdate,
          payment,
          payment_ref_id,
          time,
        ],
        (error, results) => {
          if (error) {
            return reject(error);
          } else {
            var sql = "select email,name from signup where user_id=?";
            connection.query(sql, [USER_ID], (error, results1) => {
              if (error) {
                return reject(error);
              } else {
                //var io = req.app.get('socketio');
                var sql =
                  "SELECT * FROM connection WHERE reciver_id=? AND sender_id=?";
                connection.query(sql, [USER_ID, sender_id], (err, res) => {
                  console.log(res.length);
                  if (res.length === 0) {
                    connection_id = randomnumbers(13);
                    var sql =
                      "INSERT INTO connection(connection_id,sender_id,reciver_id) VALUES(?,?,?)";
                    connection.query(
                      sql,
                      [connection_id, sender_id, USER_ID],
                      (err, res) => {
                        if (res) {
                          timestamp = Date.now();
                          message_id = randomnumbers(13);
                          let booked =
                            "YOUR APPOINTMENT IS BOOKED SUCCESSFULLY ";
                          let messagetype = "message";
                          //sender_id = req.session?.USER?.user_id ?? req.session?.DOCSTAFF?.user_id ?? req.session?.DOC_ID?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id ?? 'tessadasasdasasdt23asd2'
                          var jsonobj;
                          var sql =
                            "INSERT INTO message(message_id,sender_id,receiver_id,message,messageType,status,timestamp,readstatus,connection_id) VALUES(?,?,?,?,?,?,?,?,?)";
                          console.log(
                            time,
                            "USER_ID",
                            USER_ID,
                            "bookingdate",
                            bookingdate,
                            "sender_id",
                            sender_id
                          );
                          connection.query(
                            sql,
                            [
                              message_id,
                              sender_id,
                              USER_ID,
                              booked,
                              messagetype,
                              1,
                              timestamp,
                              0,
                              connection_id,
                            ],
                            (err, res) => {
                              var sql =
                                "SELECT doctorimage FROM Profileinfo WHERE user_id=?";
                              connection.query(sql, [USER_ID], (err, res) => {
                                var sql =
                                  "select count(readstatus) as count from message where readstatus=0";
                                connection.query(sql, (err, res) => {
                                  jsonobj.count = res[0].count;
                                });
                                jsonobj = {
                                  profile_image: res[0]?.doctorimage ?? "",
                                  from: sender_id,
                                  message_id: message_id,
                                  message: booked,
                                  type: messagetype,
                                  timestamp: timestamp,
                                };
                                var sql =
                                  "SELECT * FROM socketid WHERE user_id=? and active=1";
                                connection.query(sql, [USER_ID], (err, res) => {
                                  // if (res.length > 0) { io.to(res[0].soc_id).emit(res[0].user_id, jsonobj) }

                                  let booked =
                                    "YOUR APPOINTMENT IS BOOKED SUCCESSFULLY ";
                                  var mailOptions = {
                                    from: process.env.EMAIL,
                                    to: results1[0].email,
                                    subject: "APPOINTMENT",
                                    template: "booked",
                                    context: {
                                      booked: booked,
                                    },
                                  };
                                  mailer.sendMail(mailOptions, function (
                                    error,
                                    info
                                  ) {
                                    if (error) {
                                      return reject(error);
                                    } else {
                                    }
                                  });

                                  const response = {
                                    results: results,
                                    jsonobj: jsonobj,
                                    message: "appointment booked",
                                  };
                                  return resolve(response);
                                });
                              });
                            }
                          );
                        }
                      }
                    );
                  }
                  if (res.length > 0) {
                    timestamp = Date.now();
                    message_id = randomnumbers(13);
                    let booked = "YOUR APPOINTMENT IS BOOKED SUCCESSFULLY ";
                    let messagetype = "message";
                    //sender_id = req.session?.USER?.user_id ?? req.session?.DOCSTAFF?.user_id ?? req.session?.DOC_ID?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id ?? 'tessadasasdasasdt23asd2'
                    var jsonobj;
                    var sql =
                      "INSERT INTO message(message_id,sender_id,receiver_id,message,messageType,status,timestamp,readstatus,connection_id) VALUES(?,?,?,?,?,?,?,?,?)";
                    connection.query(
                      sql,
                      [
                        message_id,
                        sender_id,
                        USER_ID,
                        booked,
                        messagetype,
                        1,
                        timestamp,
                        0,
                        res[0].connection_id,
                      ],
                      (err, res) => {
                        var sql =
                          "SELECT doctorimage FROM Profileinfo WHERE user_id=?";
                        connection.query(sql, [USER_ID], (err, res) => {
                          var sql =
                            "select count(readstatus) as count from message where readstatus=0";
                          connection.query(sql, (err, res) => {
                            jsonobj.count = res[0].count;
                          });
                          jsonobj = {
                            profile_image: res[0]?.doctorimage ?? "",
                            from: sender_id,
                            message_id: message_id,
                            message: booked,
                            type: messagetype,
                            timestamp: timestamp,
                          };
                          var sql =
                            "SELECT * FROM socketid WHERE user_id=? and active=1";
                          connection.query(sql, [USER_ID], (err, res) => {
                            console.log(USER_ID);
                            // if (res.length > 0) { io.to(res[0].soc_id).emit(res[0].user_id, jsonobj) }

                            let booked =
                              "YOUR APPOINTMENT IS BOOKED SUCCESSFULLY ";
                            var mailOptions = {
                              from: process.env.EMAIL,
                              to: results1[0].email,
                              subject: "APPOINTMENT",
                              template: "booked",
                              context: {
                                booked: booked,
                              },
                            };
                            mailer.sendMail(mailOptions, function (
                              error,
                              info
                            ) {
                              if (error) {
                                return reject(error);
                              } else {
                              }
                            });
                            const response = {
                              results: results,
                              jsonobj: jsonobj,
                              message: "appointment booked",
                            };

                            var sql =
                              "select * from Patient where doc_id=? and user_id=?";
                            connection.query(
                              sql,
                              [sender_id, USER_ID],
                              (err, results) => {
                                if (results.length > 0) {
                                  return resolve(response);
                                } else {
                                  //var sql="insert into Patient(pat_id,doc_id,user_id,)"
                                  var sql =
                                    "select email,name,telephone from signup where user_id=?";
                                  console.log(USER_ID);
                                  connection.query(
                                    sql,
                                    [USER_ID],
                                    (err, results5) => {
                                      var sql =
                                        "select * from Patient where pat_id=? ";
                                      connection.query(
                                        sql,
                                        [USER_ID],
                                        (err, res) => {
                                          console.log(res.length);
                                          console.log("heloooooo no patient");
                                          if (res.length == 0) {
                                            var sql =
                                              "insert into Patient(pat_id,doc_id,user_id,name,email,phonenumber,status) values(?,?,?,?,?,?,?)";
                                            connection.query(
                                              sql,
                                              [
                                                USER_ID,
                                                sender_id,
                                                USER_ID,
                                                results5[0].name,
                                                results5[0].email,
                                                results5[0].telephone,
                                                0,
                                              ],
                                              (err, results) => {
                                                console.log(err);

                                                return resolve(response);
                                              }
                                            );
                                          } else {
                                            return resolve(response);
                                          }
                                        }
                                      );
                                    }
                                  );
                                }
                              }
                            );
                          });
                        });
                      }
                    );
                  }
                });
              }
            });
          }
        }
      );
    });
  });
router.put("/slot/book/:time", async (req, res) => {
  try {
    if (req.session.USER) {
      payment = req.body.response.razorpay_payment_id ? 1 : 0;
      payment_ref_id = req.body.response.razorpay_payment_id;
      time = req.params.time;
      USER_ID = req.session.USER.user_id;
      bookingdate = Date.now();
      sender_id = req.body.doc_id;

      /* 
       var io = req.app.get('socketio');
       timestamp = Date.now()
       message_id = randomnumbers(13)
       sender_id = req.session?.USER?.user_id ?? req.session?.DOCSTAFF?.user_id ?? req.session?.DOC_ID?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id ?? 'asd'
       var jsonobj
       var sql = "INSERT INTO message(message_id,center_id,receiver_id,message,messageType,status,timestamp,readstatus) VALUES(?,?,?,?,?,?,?,?)"
       connection.query(sql, [message_id, 'doctor', sender_id, 'appointment booked', 'message', 1, timestamp, 0], (err, res) => {
         var sql = "SELECT doctorimage FROM Profileinfo WHERE user_id=?"
         connection.query(sql, [user_id], (err, res) => {
           var sql = "select count(readstatus) as count from message where readstatus=0";
           connection.query(sql, (err, res) => {
             jsonobj.count = res[0].count
           })
           jsonobj = { profile_image: res[0]?.doctorimage ?? '', from: sender_id, message_id: message_id, message: req.body.message, type: 'message', timestamp: timestamp }
           var sql = "SELECT * FROM socketid WHERE user_id=? and active=1"
           connection.query(sql, [user_id], (err, res) => {
 
             if (res.length > 0) {
               io.to(res[0].soc_id).emit(res[0].user_id, jsonobj)
               io.emit(sender_id + res[0].user_id, jsonobj)
             }
           })
         })
       })*/
      let result = await bookappoi(
        time,
        USER_ID,
        bookingdate,
        sender_id,
        payment,
        payment_ref_id
      );
      res.send(result).status(200);
    } else {
      res
        .status(401)
        .send({ message: "only users are allowed to book appointment" });
    }
  } catch (error) {
    res.send(error).status(500);
  }
});
let deleteschedule = (sch_id) =>
  new Promise((resolve, reject) => {
    let sql = "DELETE FROM Doctorschedule WHERE sch_id=?";
    connection.query(sql, sch_id, (error, results) => {
      if (error) return reject(error);
      if (results) return resolve(results);
    });
  });
let getslotsdoctor = (doc_id) =>
  new Promise((resolve, error) => {
    let sql = "SELECT * FROM Booking  WHERE  user_id=? AND booked=1 ";
    //let sql="select b.date,b.startAt,b.endAt,b.mode from Booking b where doc_id=? and b.booked=1";
    connection.query(sql, [doc_id], (error, results) => {
      if (error) reject(error);
      if (results) resolve(results);
    });
  });

router.get("/slots/fetch/:id", async (req, res) => {
  console.log(req.params.id);

  try {
    let doc_id = req.params.id;
    let result = await getslotsdoctor(doc_id);
    res.send(result).status(200);
  } catch (error) {
    res.send(error).status(500);
  }
});
let slotsbyid = (id) =>
  new Promise((resolve, reject) => {
    let sql = "SELECT * FROM Booking WHERE id=?";
    connection.query(sql, id, (error, results) => {
      if (error) reject(error);
      if (results) resolve(results);
    });
  });
router.get("/slotbyid/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let results = await slotsbyid(id);
    res.send(results).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});
let updateslotbyid = (data, user_id) =>
  new Promise((resolve, reject) => {
    let sql =
      "UPDATE Booking SET startAt=?, endAt=?, cha_id=?, status=? WHERE id=?";
    connection.query(sql, data, (error, results) => {
      if (error) {
        return reject(error);
      } else {
        var sql = "select email from signup where user_id=?";
        connection.query(sql, [user_id], (error, results1) => {
          if (error) {
            return reject(error);
          } else {
            if (status == 1) {
              booked = "YOUR APPOINTMENT IS PENDING";
              var mailOptions = {
                from: process.env.EMAIL,
                to: results1[0].email,
                subject: "BOOKING APPOINTMENT",
                template: "booked",
                context: {
                  booked: booked,
                },
              };
              mailer.sendMail(mailOptions, function (error, info) {
                if (error) {
                  return reject(error);
                } else {
                }
              });
              return resolve(results);
            } else {
              booked = "YOUR APPOINTMENT IS COMPLETED";
              var mailOptions = {
                from: process.env.EMAIL,
                to: results1[0].email,
                subject: "BOOKING APPOINTMENT",
                template: "booked",
                context: {
                  booked: booked,
                },
              };
              mailer.sendMail(mailOptions, function (error, info) {
                if (error) {
                  return reject(error);
                } else {
                }
              });

              return resolve(results);
            }
          }
        });
      }
    });
  });
let insertReview = (doctor_id, user_id, id) =>
  new Promise((resolve, reject) => {
    console.log(doctor_id, user_id, id);
    let sql =
      "INSERT INTO review(doctor_id,user_id,isactive,id) VALUES(?,?,?,?)";
    connection.query(sql, [doctor_id, user_id, 1, id], (err, res) => {});
  });
router.put("/slotbyid", async (req, res) => {
  try {
    id = req.body.id;
    startAt = req.body.startAt;
    endAt = req.body.endAt;
    cha_id = req.body.chambarname;
    user_id = req.body.user_id;
    status = parseInt(req.body.status);
    data = [startAt, endAt, cha_id, status, id];
    console.log(status);
    console.log(req.session);
    if (req.session.DOC) {
      if (status === 2) {
        doctor_id = req.session?.DOC.user_id;
        let result = insertReview(doctor_id, user_id, id);
      }
    } else if (req.session.DOCSTAFF) {
      if (status === 2) {
        doctor_id = req.session?.DOC_ID;
        let result = insertReview(doctor_id, user_id, id);
      }
    }

    let results = await updateslotbyid(data, user_id);
    res.send(results).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});
let slotsbyiddelete = (id) =>
  new Promise((resolve, reject) => {
    let sql = "UPDATE Booking SET booked=0 WHERE id=?";
    connection.query(sql, id, (error, results) => {
      if (error) {
        return reject(error);
      } else {
        var sql = "select status,user_id from Booking where id=?";
        connection.query(sql, id, (err, results1) => {
          if (error) {
            return reject(error);
          } else {
            var sql = "select email from signup where user_id=?";
            connection.query(sql, results1[0].user_id, (error, results2) => {
              if (error) {
                return reject(error);
              } else {
                if (results1[0].status == 1 || results1[0].status == 0) {
                  booked = "YOUR APPOINTMENT IS CANCELLED";

                  var mailOptions = {
                    from: process.env.EMAIL,
                    to: results2[0].email,
                    subject: "APPOINTMENT ",
                    template: "booked",
                    context: {
                      booked: booked,
                    },
                  };
                  mailer.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      return reject(error);
                    } else {
                    }
                  });

                  return resolve(results);
                } else {
                  return resolve(results);
                }
              }
            });
          }
        });
      }
    });
  });
router.delete("/slotbyid/:id", (req, res) => {
  try {
    let id = req.params.id;
    let result = slotsbyiddelete(id);
    res.send(result).status(200);
  } catch (error) {
    res.send(err).status(400);
  }
});
router.delete("/schedule/delete/:id", async (req, res) => {
  try {
    let sch_id = req.params.id;

    let results = await deleteschedule(sch_id);
    res.send(results).status(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/schedule/update/:id", async (req, res) => {
  try {
    sch_id = req.params.id;
    startAt = req.body.START_DATE;
    endAt = req.body.END_DATE;
    perPatientTime = req.body.TIME_PER_PATIENT;
    cha_id = req.body.CHA_ID;
    mode = req.body.MODE;

    let scheduleupdate = await updateSchedule(
      sch_id,
      startAt,
      endAt,
      perPatientTime,
      cha_id,
      mode
    );
    res.status(200).send(scheduleupdate);
  } catch (error) {
    res.status(400).send(error);
  }
});

updateSchedule = (sch_id, startAt, endAt, perPatientTime, cha_id, mode) => {
  return new Promise((resolve, reject) => {
    var sql =
      "update Doctorschedule set startAt=?,endAt=?,timePerPatient=?,cha_id=?,mode=? where sch_id=?";
    connection.query(
      sql,
      [startAt, endAt, perPatientTime, cha_id, mode, sch_id],
      (error, results) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(results);
        }
      }
    );
  });
};
router.get("/set", (req, res) => {
  // var sql="select b.book_id,b.doc_id,b.sch_id,s.user_id,b.startAt,b.endAt,b.booking,b.mode from Booking b  right join signup s on b.user_id=s.user_id";
  var sql = "select * from Booking b ,signup  s where s.user_id=b.user_id";
  connection.query(sql, (error, results) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(200).send(results);
    }
  });
});
router.get("/set/:doc_id", (req, res) => {
  var doc_id = req.params.doc_id;

  var sql =
    "select b.startAt,b.endAt,b.mode,c.chambarname from Booking b, Chambar c where c.cha_id=b.cha_id  and b.booked=1 and b.doc_id=?";

  connection.query(sql, [doc_id], (error, results) => {
    if (error) {
    } else {
      res.status(200).send(results);
    }
  });
});

router.get("/bookedapp", (req, res) => {
  var sql = "select count(*) as TOTAL from Booking  ";
  connection.query(sql, (error, results) => {
    if (error) {
      res.status(400).send(error);
    } else {
      var sql =
        " select count(*) as PENDING from Booking where booked=1 and status=0";
      connection.query(sql, (error, results1) => {
        if (error) {
          res.status(400).send(error);
        } else {
          var sql = "select count(*) as  BOOKED from Booking where booked=1";
          connection.query(sql, (error, results2) => {
            if (error) {
              res.status(400).send(error);
            } else {
              var sql =
                "select count(*) as VISITED from Booking where booked=1 and status=2 ";
              connection.query(sql, (error, results3) => {
                if (error) {
                  res.status(400).send(error);
                } else {
                  var sql =
                    "select count(*) as  UNBOOKED from  Booking where booked=0";
                  connection.query(sql, (error, results4) => {
                    if (error) {
                      res.status(400).send(error);
                    } else {
                      var sql =
                        "select count(*) as COMPLETED from Booking where booked=1 and status=2";
                      connection.query(sql, (error, results5) => {
                        const response = {
                          TOTAL_APPOINTMENTS: results[0].TOTAL,
                          PENDING: results1[0].PENDING,
                          COMPLETED: results5[0].COMPLETED,
                          BOOKED: results2[0].BOOKED,
                          VISITED: results3[0].VISITED,
                          UNBOOKED: results4[0].UNBOOKED,
                        };

                        res.status(200).send(response);
                        //res.status(200).send({'appointment':results,'pending':results1,'Booked':results2,'visited':results3,'unbooked':results4,'completed':results5})
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

/*
router.put('/update',async (req,res)=>{
    try{
        const set_id=randomnumbers(10),
        data=req.body.data,
        doc_id=req.body.doc_id
        let updateset = await setUpdate(set_id,doc_id,data);
        res.status(200).send(updateset);
    }
    catch(error){
        res.status().send(error);
    }
})*/

router.get("/set/:app_id", (req, res) => {
  var app_id = req.params.app_id;

  // var sql="select s.name,s.email,s.telephone ,a.time,a.status,a.chambarname from Appointment a,signup s where a.user_id=s.user_id";
  //var sql="select s.name,s.email,s.telephone,a.time,a.status,a.chambarname from Appointment a,signup s,Patient p where a.user_id=p.pat_id and p.pat_id=s.user_id";
  var sql =
    "select a.status,a.time,a.chambarname,p.pat_id,p.user_id,s.name,s.email,s.telephone  from Appointment a,Patient p ,signup s where p.pat_id=a.user_id  and p.user_id=s.user_id and app_id=?";
  connection.query(sql, [app_id], (error, results) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(200).send(results);
    }
  });
});

router.get("/", (req, res) => {
  //var sql="select count() as BOOKED from Booking where booked in (select count() as pending from Booking  where status=1)  ";
  //var sql="select count (select count(*) as pending from Booking where booked=1 and status=0) from Booking";
  //var sql="select  *,(select )"
  // var sql="select booked , count(*) from Booking where status=1 group by booked  having  booked=1 "
  //var sql="select count(booked) ,count(status) from Booking   group by status,booked  having booked=1 and status=1";

  var sql = "select booked ,status from Booking ";

  connection.query(sql, (error, results) => {
    if (error) {
    }
    res.status(200).send(results);
  });
});

bookedappointment = (doc_id) => {
  return new Promise((resolve, reject) => {
    var sql =
      "select  count(*) as BOOKED from Booking where booked=1  and doc_id=?";
    connection.query(sql, [doc_id], (error, results) => {
      if (error) {
        return reject(error);
      } else {
        var sql =
          "select count(*) as UNBOOKED from Booking where booked=0 and doc_id=? ";
        connection.query(sql, [doc_id], (error, results1) => {
          if (error) {
            return reject(error);
          } else {
            var sql =
              "select count(*) as VERIFIED from Booking where booked=1 and status=1 and doc_id=? ";
            connection.query(sql, [doc_id], (error, results2) => {
              if (error) {
                return reject(error);
              } else {
                var sql =
                  "select count(*) as PENDING from Booking where booked=1 and status=1  and doc_id=?";
                connection.query(sql, [doc_id], (error, results3) => {
                  if (error) {
                    return reject(error);
                  } else {
                    var sql =
                      "select count(*) as COMPLETED from Booking where booked=1 and status=2  and doc_id=?";
                    connection.query(sql, [doc_id], (error, results4) => {
                      if (error) {
                        return reject(error);
                      } else {
                        let response = {
                          BOOKED: results[0].BOOKED,
                          UNBOOKED: results1[0].UNBOOKED,

                          PENDING: results3[0].PENDING,
                          COMPLETED: results4[0].COMPLETED,
                        };
                        return resolve(response);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });
};

router.get("/bookedapp", async (req, res) => {
  try {
    if (req.session.DOC) {
      let doc_id = req.session.DOC.user_id;
      let booked = await bookedappointment(doc_id);
      res.status(200).send(booked);
    } else {
      res.status().send({ message: "NOT ALLOWED" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/datebetween/:firstdate/:seconddate", (req, res) => {
  let firstdate = req.params.firstdate;
  seconddate = req.params.seconddate;

  //var sql="select * from Booking where bookingdate between  ?   and  ?";
  var sql = "select * from Doctorschedule where date between ? and ?";
  connection.query(sql, [firstdate, seconddate], (error, results) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(200).send(results);
    }
  });
});

router.get("/crossthreetables", (req, res) => {
  var sql =
    "select ds.sch_id,ds.doc_id,ds.date,ds.startAT,ds.endAt,ds.location as chambar_id,ds.mode,ds.gap,pi.prof_id,pi.user_id,pi.name,pi.degree,pi.experienceyears,pi.email,pi.phone,pi.aboutme,pi.doctorimage,pi.specialist,pi.gender,d.doc_id,d.doctorimg,d.doctorname,d.email,d.gender,d.phonenumber,d.access,d.signupdate,c.cha_id,c.doc_id,c.deptname,c.chambarname,c.title,c.appointmentLimit,c.address  from Doctorschedule ds  INNER JOIN  Profileinfo pi INNER JOIN Doctor d INNER JOIN Chambar c where ds.doc_id=pi.user_id and pi.user_id=d.doc_id and c.doc_id=d.doc_id ";
  connection.query(sql, (error, results) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(200).send(results);
    }
  });
});

userreviews = (id) => {
  return new Promise((resolve, reject) => {
    var sql = "select review ,user_id from Booking where user_id=?";
    connection.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/reviews", async (req, res) => {
  try {
    if (req.session.USER) {
      let id = req.session.USER.user_id;
      var sql =
        "select b.review,d.doctorname from Booking b,Doctor d where d.doc_id=b.doc_id and user_id=?";
      connection.query(sql, [id], (err, results) => {
        res.status(200).send(results);
      });
    } else {
      res.status(400).send("not allowed");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

reviewsfetch = () => {
  return new Promise((resolve, reject) => {
    var sql = "select  user_id ,review from Booking";
    connection.query(sql, (err, results) => {
      return resolve(results);
    });
  });
};

router.get("/reviews", async (req, res) => {
  try {
    let fetch = await reviewsfetch();
    res.status(200).send(fetch);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/bookedfetchall", (req, res) => {
  let id = req.session.USER.user_id;

  //var sql="select items,doc_id from Booking where user_id=?";
  var sql =
    "select b.items,d.doctorname from Booking b ,Doctor d where b.doc_id=d.doc_id and user_id=?";

  connection.query(sql, [id], (err, results) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(results);
    }
  });
});

slotsfetchall = () => {
  return new Promise((resolve, reject) => {
    var sql = "select  DISTINCT startAt from Doctorschedule ";
    connection.query(sql, (err, res) => {
      if (err) {
        return reject(err);
      } else {
        let slots = [];
        for (var i = 0; i < res.length; i++) {
          slots.push(res[i].startAt);
        }
        return resolve(slots);
      }
    });
  });
};

router.get("/slots/fetchAll", async (req, res) => {
  try {
    const fetch = await slotsfetchall();
    res.status(200).send(fetch);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

docwithoutloc = (doc_id, locationid) => {
  return new Promise((resolve, reject) => {
    if (locationid != "undefined") {
      var sql =
        "select date from Doctorschedule   where doc_id=? and location=? group by date";
      connection.query(sql, [doc_id, locationid], (err, results) => {
        if (err) {
          return reject(err);
        } else {
          let dates = [];
          for (var i = 0; i < results.length; i++) {
            dates.push(results[i].date);
          }
          return resolve(dates);
        }
      });
    } else {
      var sql =
        "select date from Doctorschedule   where doc_id=?  group by date";
      connection.query(sql, [doc_id], (err, results) => {
        if (err) {
          return reject(err);
        } else {
          let dates = [];
          for (var i = 0; i < results.length; i++) {
            dates.push(results[i].date);
          }
          return resolve(dates);
        }
      });
    }
  });
};

docByloc = (doc_id, locationid) => {
  return new Promise((resolve, reject) => {
    var sql =
      "select date from Doctorschedule   where doc_id=? and location=? group by date";
    connection.query(sql, [doc_id, locationid], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/docbyloc/:doc_id/:id", async (req, res) => {
  try {
    let doc_id = req.params.doc_id;

    locationid = req.params.id;

    const locdoc = await docByloc(doc_id, locationid);
    res.status(200).send(locdoc);
  } catch (error) {
    res.status(400).send(error);
  }
});

updsch = (
  sch_id,
  doc_id,
  stringObj,
  date,
  location,
  mode,
  startAt,
  myArray
) => {
  return new Promise((resolve, reject) => {
    let slots = stringObj.replace(/['"]+/g, "");
    if (mode == 1) {
      let locationupdate = 0;
      var sql =
        "update Doctorschedule set doc_id=?,startAt=?,date=?,location=?,mode=? where sch_id=?";
      connection.query(
        sql,
        [doc_id, slots, date, locationupdate, mode, sch_id],
        (err, results) => {
          if (err) {
            return reject(err);
          } else {
            var sql = "delete from Booking where sch_id=? and booked=0";
            connection.query(sql, [sch_id], (err, results1) => {
              return resolve(results1);
            });
          }
        }
      );
    } else {
      var sql =
        "update Doctorschedule set doc_id=?,startAt=?,date=?,location=?,mode=? where sch_id=?";
      connection.query(
        sql,
        [doc_id, slots, date, location, 0, sch_id],
        (err, results) => {
          if (err) {
            return reject(err);
          } else {
            var sql = "delete from Booking where sch_id=? and booked=0";
            connection.query(sql, [sch_id], (err, results1) => {
              return resolve(results1);
            });
          }
        }
      );
    }
  });
};

router.put("/schedule/put/:id", async (req, res) => {
  //const slot='10:05 AM,11:45 AM,07:00 PM,08:00 A.M'
  const a = req.body.data.startAt.slice(",");
  //const a=slot.slice(',')
  //console.log(a)
  const b = "" + a + "";
  //console.log(b)

  function listToArray(fullString, separator) {
    var fullArray = [];

    if (fullString !== undefined) {
      if (fullString.indexOf(separator) == -1) {
        fullArray.push(fullString);
      } else {
        fullArray = fullString.split(separator);
      }
    }

    return fullArray;
  }
  var myArray = listToArray(b, ",");

  try {
    let sch_id = req.body.data.sch_id;
    doc_id = req.body.data.doc_id;
    startAt = req.body.data.startAt;
    date = req.body.data.date;
    location = req.body.data.location;
    mode = req.body.data.mode;
    var stringObj = JSON.stringify(myArray);

    const updatesch = await updsch(
      sch_id,
      doc_id,
      stringObj,
      date,
      location,
      mode,
      startAt,
      myArray
    );
    res.status(200).send(updatesch);

    let result = [];
    let status = 0;
    let bookingdate = date;
    let slotlen = startAt.length;

    for (var i = 0; i < startAt.length; i++) {
      result.push({
        startAt: startAt[i],
        doc_id: doc_id,
        sch_id: sch_id,
        booked: 0,
        status: 0,
        bookingdate: date,
      });
    }

    let slot = await slotinsert(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

getdatebylocslot = (date, doc_id, loc_id) => {
  return new Promise((resolve, reject) => {
    console.log(loc_id != "undefined");

    if (loc_id != "undefined") {
      var sql =
        "select startAt from  Booking where  doc_id=? and bookingdate=?  and booked!=1";
      // var sql="select startAt from Booking where  bookingdate=? and doc_id=? and cha_id=? and booked!=3";
      connection.query(sql, [doc_id, date], (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        } else {
          let slots = [];
          for (var i = 0; i < result.length; i++) {
            slots.push(result[i].startAt);
          }
          const response = slots;
          return resolve(response);
        }
      });
    } else {
      var sql =
        "select startAt from Booking where doc_id=? and bookingdate=? and cha_id=? and booked!=1";
      connection.query(sql, [doc_id, date, 0], (err, results) => {
        if (err) {
          return reject(err);
        } else {
          let slots = [];
          for (var i = 0; i < results.length; i++) {
            slots.push(results[i].startAt);
          }
          const response = slots;
          return resolve(response);
        }
      });
    }
  });
};

router.get("/getdate/:doc_id/:loc_id/:date", async (req, res) => {
  try {
    let date = req.params.date;
    doc_id = req.params.doc_id;
    loc_id = req.params.loc_id;

    const getdate = await getdatebylocslot(date, doc_id, loc_id);
    res.status(200).send(getdate);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/schedule/:id", (req, res) => {
  let doc_id = req.params.id;
  var sql =
    "select  date,startAt,location,mode,sch_id,doc_id   from Doctorschedule  where doc_id=? and mode =1 and location=0";
  connection.query(sql, [doc_id], (err, results) => {
    if (err) {
      return reject(err);
    } else {
      var sql =
        "select d.date,d.startAt,a.location,d.mode,d.sch_id,d.doc_id from Doctorschedule d,address a where a.add_id=d.location and mode=0 and d.doc_id=? ";
      connection.query(sql, [doc_id], (err, results1) => {
        const response = {
          res1: results,
          res2: results1,
        };
        res.status(200).send(response);
      });
    }
  });
});

getdatebyslots = (date, doc_id) => {
  return new Promise((resolve, reject) => {
    var sql =
      "select startAt,booked from Booking where bookingdate=? and doc_id=? and booked!=3";
    //var sql="select startAt,id from Booking where bookingdate=? and doc_id=? and booked!=3";
    connection.query(sql, [date, doc_id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        console.log(results);
        let slots = [];
        for (var i = 0; i < results.length; i++) {
          slots.push(results[i].startAt);
        }
        const response = slots;
        return resolve(response);
      }
    });
  });
};

router.get("/getdate/:doc_id/:date", async (req, res) => {
  try {
    let date = req.params.date;
    doc_id = req.params.doc_id;

    const getdate = await getdatebyslots(date, doc_id);
    res.status(200).send(getdate);
  } catch (error) {
    res.status(400).send(error);
  }
});

var api = require("../node_modules/clicksend/api");
let nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "dinesh.abcdj@gmail.com",
    pass: "Dinesh@432",
  },
});
deletebyslotid = (id, date) => {
  return new Promise((resolve, reject) => {
    var sql = "delete from Doctorschedule where sch_id=?";
    connection.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        var sql =
          "select * from Bookng  where sch_id=? and booked=0 and bookingdate=?";
        connection.query(sql, [id, date], (err, results) => {
          var sql =
            "select bookingdate,startAt from Booking where booked!=0 and sch_id=?";
          connection.query(sql, [id], (err, results) => {
            if (results.length > 0) {
              for (var i = 0; i < results.length; i++) {
                var sql = "select email from bookapp where date=? and time=?";
                connection.query(
                  sql,
                  [results[i].bookingdate, results[i].startAt],
                  (err, emailresults) => {
                    for (var j = 0; j < emailresults.length; j++) {
                      console.log(emailresults[j].email);
                      let message = "your appointment is cancelled" + date;
                      console.log(message);
                      var mailOptions = {
                        from: process.env.EMAIL,
                        to: emailresults[j].email,
                        subject: "CANCELLED YOUR  APPOINTMENT",
                        template: "slots",
                        context: {
                          booked: message,
                        },
                      };
                      console.log(mailOptions);
                      mailer.sendMail(mailOptions, function (error, data) {
                        if (error) {
                          return reject(error);
                        } else {
                        }
                      });

                      let response = {
                        message: "slots deleted  data succesfully",
                      };
                      let sql = "delete from Booking where sch_id=?";
                      connection.query(sql, [id], (err, results) => {
                        var sql = "delete from bookapp where date=?";
                        connection.query(sql, [date], (err, results) => {});
                      });
                      return resolve(response);
                    } //inner for looop
                  }
                );
              } //outer for loop
            } else {
              var sql = "delete from Booking where sch_id=?";
              connection.query(sql, [id], (err, data) => {
                var sql = "delete from bookapp where date=?";
                connection.query(sql, [date], (err, results) => {
                  if (err) throw err;
                  return resolve({ message: "slots  deleted sucessfully" });
                });
              });
            }
          });
        });
      }
    });
  });
};

router.delete("/schedule/set/:id/:date", async (req, res) => {
  try {
    let id = req.params.id;
    date = req.params.date;

    const deleteslot = await deletebyslotid(id, date);
    res.status(200).send(deleteslot);
  } catch (error) {
    res.status(400).send(error);
  }
});
module.exports = router;
/*
var sql = "delete from Booking where booked=0 and sch_id=? and bookingdate=?";
connection.query(sql, [id, date], (err, results) => {
  var sql =
    "select bookingdate,startAt from Booking where sch_id=? and  booked!=0";
  connection.query(sql, [id], (err, results) => {
    for (var i = 0; i < results.length; i++) {
      var sql = "select email from bookapp where date=? and time=?";
      connection.query(
        sql,
        [results[i].bookingdate, results[i].startAt],
        (err, emailres) => {
          for (var j = 0; j < emailres.length; j++) {
            console.log(results);
            console.log(emailres[j].email);
            let message = "YOUR APPOINTMENT IS CANCELLED";
            var mailOptions = {
              from: process.env.EMAIL,
              to: emailres[j].email,
              subject: "CANCELLED YOUR  APPOINTMENT",
              template: "deleteslots",
              context: {
                booked: message,
              },
            };
            mailer.sendMail(mailOptions, function (error, info) {
              if (error) {
                return reject(error);
              } else {
                console.log(info);
              }
            });
            let response = {
              message: "slots deleted succesfully",
            };
            return resolve(response);
          } //for loop close
        }
      );
    }
  });
});
*/

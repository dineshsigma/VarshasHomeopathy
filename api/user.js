let router = require('express').Router()
const { reject } = require('bcrypt/promises');
let { connection } = require('../db')





bookedappointment = (user_id) => {
  return new Promise((resolve, reject) => {
    var sql = "select  count(*) as BOOKED from Booking where booked=1 and user_id=?";
    connection.query(sql, [user_id], (error, results) => {
      if (error) {
        return reject(error);
      }
      else {
        var sql = "select count(*) as UNBOOKED from Booking where booked=0 and user_id=?";
        connection.query(sql, [user_id], (error, results1) => {
          if (error) {
            return reject(error);
          }
          else {
            var sql = "select count(*) as VERIFIED from Booking where booked=1 and status=1 and user_id=?";
            connection.query(sql, [user_id], (error, results2) => {
              if (error) {
                return reject(error);
              }
              else {
                var sql = "select count(*) as PENDING from Booking where booked=1 and status=1 and user_id=?";
                connection.query(sql, [user_id], (error, results3) => {
                  if (error) {
                    return reject(error);
                  }
                  else {
                    var sql = "select count(*) as COMPLETED from Booking where booked=1 and status=2 and user_id=?";
                    connection.query(sql, [user_id], (error, results4) => {
                      if (error) {
                        return reject(error);
                      }
                      else {
                        let response = {
                          "BOOKED": results[0].BOOKED,
                          "UNBOOKED": results1[0].UNBOOKED,

                          "PENDING": results3[0].PENDING,
                          "COMPLETED": results4[0].COMPLETED
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
      }
    })
  })
}

router.get('/bookedapp', async (req, res) => {


  try {
    if (req.session.USER) {
      let user_id = req.session.USER.user_id;
      let booked = await bookedappointment(user_id);
      res.status(200).send([booked]);

    }
    else {
      res.send({ message: 'Not Allowed' }).status(401)
    }

  }
  catch (error) {
    res.status(400).send(error);
  }
})

let userbooking = user_id =>
  new Promise((resolve, reject) => {
    let sql = "SELECT * FROM Booking INNER JOIN Doctor ON Booking.doc_id=Doctor.doc_id WHERE Booking.user_id=? AND Booking.booked =1 "
    connection.query(sql, user_id, (err, res) => {
      if (err) reject(err)
      if (res) resolve(res)
    })
  })
let userbookingdash = user_id =>
  new Promise((resolve, reject) => {
    let sql = "SELECT * FROM Booking INNER JOIN Doctor ON Booking.doc_id=Doctor.doc_id WHERE Booking.user_id=? AND Booking.booked =1 ORDER BY Booking.bookingdate LIMIT 5 "
    connection.query(sql, [user_id], (err, res) => {
      if (err) reject(err)
      if (res) resolve(res)
    })
  })
router.get('/userbooking', async (req, res) => {
 
  try {
    if (req.session.USER) {
      let user_id = req.session.USER.user_id
      let results = await userbooking(user_id)
      res.send(results).status(200)
    }
    else {
      res.send({ message: "not allowed" }).status(401)
    }
  } catch (error) {
    res.send(error).status(500)

  }
})

router.get('/userbookingdash', async (req, res) => {
  try {
    if (req.session.USER) {
      let user_id = req.session.USER.user_id
      let results = await userbookingdash(user_id)
      res.send(results).status(200)
    }
    else {
      res.send({ message: "not allowed" }).status(401)
    }
  } catch (error) {

    res.send(error).status(500)

  }
})
let getReviews = user_id =>
  new Promise((resolve, reject) => {
    let sql = "SELECT * FROM review INNER JOIN Doctor ON review.doctor_id=Doctor.doc_id WHERE review.user_id=? AND isactive=1"
    connection.query(sql, user_id, (err, res) => {
      if (err) reject(err)
      if (res) resolve(res)
    })
  })
router.get('/review', async (req, res) => {
  try {
    if (req.session.USER) {
      user_id = req.session?.USER.user_id
      let results = await getReviews(user_id)
      res.send(results).status(200)
    }
    else {
      res.send({ message: "not allowed" }).status(401)
    }
  } catch (error) {
    res.send(error).status(500)

  }
})
let reviewPost = () =>
  new Promise((resolve, reject) => {
    let sql = "UPDATE review SET"
  })
router.post('/review/:id', async (req, res) => {
  try {
    if (req.session.USER) {
      user_id = req.session.USER?.user_id
      res.send("helo").status(200)
      let results = await reviewPost(user_id)

    }
    else {
      res.send({ message: "not allowed" }).status(401)
    }
  } catch (error) {
    res.send(error).status(500)
  }
})
router.get('/check', (req, res) => {
  if (req.session.USER) {
    res.status(200).send(req.session.USER)
  }
  else {
    res.status(401).send({ message: 'not logged in' })
  }
})
module.exports = router;

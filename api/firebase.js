const { reject, select } = require('async')
const { connection } = require('../db')
require('dotenv').config()
let router = require('express').Router()
let admin = require('firebase-admin');
let serviceAccount = require("./uptopointrta-prod-firebase-adminsdk-wmjng-aed9441d60.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

let firebase = (user_id, doc_id, token, isactive) =>
    new Promise((resolve, reject) => {

        let sql = "SELECT * FROM Notification WHERE token=?"
        connection.query(sql, token, (err, res) => {
            if (err) {
                reject(err)
            }
            if (res.length === 0) {
                let sql = "INSERT INTO Notification(user_id,doc_id,token,isactive) VALUES(?,?,?,?)"
                connection.query(sql, [user_id, doc_id, token, isactive], (err, res) => {
                    if (err) reject(err)
                    if (res) resolve(res)
                })
            }
            else {
                let sql = "UPDATE Notification SET isActive=1,user_id=?,doc_id=? WHERE token=?"
                connection.query(sql, [user_id, doc_id, token], (err, res) => {

                    if (err) reject(err)
                    if (res) resolve(res)
                })
            }
        })

    })
router.post('/insert', async (req, res) => {
    try {

        let user_id = req.session?.USER?.user_id
            ?? req.session?.DOC?.user_id
            ?? req.session?.DOC_STAFF?.user_id
            ?? req.session?.ADMIN?.user_id
            ?? req.session?.SUPER_ADMIN?.user_id
        isactive = 1
        let token = req.body.token

        let doc_id = req.session?.DOC_ID ?? req.session?.DOC?.user_id ?? ''


        if (user_id) {

            let results = await firebase(user_id, doc_id, token, isactive)
            res.status(202).send(results);
        }
        else {

            res.status(401).send({ message: 'not allowed to insert' })
        }
    } catch (error) {

        res.status(500).send(error)
    }
})
let adminnotification = (body, title) => {
    new Promise((resolve, reject) => {
        sql = "SELECT * FROM signup CROSS JOIN Notification ON signup.user_id =Notification.user_id WHERE signup.accessLevel > 2 AND Notification.isactive=1 AND Notification.isActive=1"
        connection.query(sql, (err, res) => {
            if (err) reject(err)
            if (res.length > 0) {
                let payload = {
                    notification: {
                        title: title,
                        body: body
                    },
                };

                let options = {
                    priority: "high",
                    timeToLive: 60 * 60 * 24
                };
                res.forEach(element => {
                    let registrationToken = element.token
                    admin.messaging().sendToDevice(registrationToken, payload, options)
                        .then(function (response) {

                            resolve("sent");
                        })
                        .catch(function (error) {
                            reject("failed");
                        });
                });
            }

        })
    })
}
router.post('/adminnotification', async (req, res) => {
    try {

        let body = req.body.body
        let title = req.body.title
        let results = await adminnotification(body, title)
        res.status(200).send(results)
    } catch (error) {
        res.status(500).send(error)
    }
})
let notification = (user_id, body, title) =>
    new Promise((resolve, reject) => {
        let sql = "SELECT * FROM Notification WHERE user_id=? AND isActive=1"
        connection.query(sql, (user_id), (err, res) => {
            if (err) reject(err)
            if (res.length > 0) {
                let payload = {
                    notification: {
                        title: title,
                        body: body
                    },
                };

                let options = {
                    priority: "high",
                    timeToLive: 60 * 60 * 24
                };
                res.forEach(element => {
                    let registrationToken = element.token
                    admin.messaging().sendToDevice(registrationToken, payload, options)
                        .then(function (response) {
                            console.log(response)

                            resolve("sent");
                        })
                        .catch(function (error) {
                            reject("failed");
                        });
                });
            }
            console.log(res.length)
            if (res.length === 0) {
                reject('no permission')
            }
        })
    })
router.post('/usernotification', async (req, res) => {
   
    try {

        user_id = req.body.user_id ?? ''
        body = req.body.body ?? ''
        title = req.body.title ?? ''
        let results = await notification(user_id, body, title)
        res.status(200).send(results)
    } catch (error) {
        res.status(400).send(error)
    }
})
let doctor = (sch_id, id, doc_id) =>
    new Promise((resolve, reject) => {
        let sql = "SELECT * FROM Booking CROSS JOIN signup ON Booking.user_id=signup.user_id  CROSS JOIN Notification ON Booking.doc_id = Notification.doc_id  CROSS JOIN Doctorschedule ON Booking.doc_id=Doctorschedule.doc_id WHERE Booking.id=? AND Doctorschedule.sch_id=? AND  Notification.isActive=1"
        connection.query(sql, [id, sch_id], (err, res) => {
            if (err) reject(err)
            console.log(res)
            if (res.length > 0) {
                resolve({ message: 'sending notifications' })
                let payload = {
                    notification: {
                        title: `user booked an appointment`,
                        body: `on date ${res[0]?.date}`
                    },
                    data: {
                        timeStart: `start time:${res[0]?.startAT}`,
                        timeEnd: `end time:${res[0]?.endAt}`

                    }
                };

                let options = {
                    priority: "high",
                    timeToLive: 60 * 60 * 24
                };
                res.forEach(element => {
                    let registrationToken = element.token
                    admin.messaging().sendToDevice(registrationToken, payload, options).then(resolve => {

                    }).catch(err => {

                    })
                });

            }
            if (res.length === 0) {
                resolve({ message: "cant send notification" })
            }
        })
    })
router.post('/doctor', async (req, res) => {
    try {

        sch_id = req.body.sch_id
        id = req.body.id
        doc_id = req.body.doc_id
        let result = await doctor(sch_id, id, doc_id)
        res.status(200).send(result)
    } catch (error) {
        res.status(200).send(error)

    }
})
let user = (sch_id, id, user_id, title, body) =>
    new Promise((resolve, reject) => {
        let sql = "SELECT * FROM Booking INNER JOIN Chambar ON Booking.cha_id=Chambar.cha_id INNER JOIN Notification ON Booking.user_id=Notification.user_id WHERE Booking.id=? AND Notification.isActive=1 AND Notification.user_id=?"
        connection.query(sql, [id, user_id], (err, res) => {
            if (res?.length > 0) {
                let body2 = body + ` at chamber ${res[0]?.chambarname}`
                let payload = {
                    notification: {
                        title: title,
                        body: body2
                    },
                    data: {
                        timeStart: `start time:${res.startAT}`,
                        timeEnd: `end time:${res.endAt}`

                    }
                };

                let options = {
                    priority: "high",
                    timeToLive: 60 * 60 * 24
                };
                res.forEach(element => {
                    let registrationToken = element.token
                    admin.messaging().sendToDevice(registrationToken, payload, options).then(resolve => {

                    }).catch(err => {

                    })
                });
            }
            else {

                reject({ message: 'rejected' })
            }
        })
    })
router.post('/user', async (req, res) => {
    try {

        sch_id = req.body.sch_id
        id = req.body.id
        user_id = req.body.user_id
        title = req.body.title
        body = req.body.body
        let result = await user(sch_id, id, user_id, title, body)
        res.status(200).send(result)

    } catch (error) {

        res.status(400).send(error)
    }
})
module.exports = router
var express = require('express');
var router = express.Router();
let { connection } = require('../db');
const { randomnumbers } = require('../randomgenerator/randomnumber');

messageSocket = (receiver_id, connection_id, timestamp, message_id, sender_id, message, messageType, io) => {
    return new Promise((resolve, reject) => {
        var sql = "select email,name from signup where user_id=?";
        connection.query(sql, [receiver_id], (err, signres) => {


            var jsonobj = {}
            jsonobj['connection_id'] = connection_id
            jsonobj['message'] = message
            jsonobj['messageType'] = messageType
            jsonobj['timestamp'] = timestamp
            jsonobj['email'] = signres[0].email
            jsonobj['sender_id'] = sender_id

            jsonobj['name'] = signres[0].name
            var sql = "INSERT INTO message(message_id,receiver_id,connection_id,sender_id,message,messageType,status,timestamp,readstatus) VALUES(?,?,?,?,?,?,?,?,?)"
            connection.query(sql, [message_id, receiver_id, connection_id, sender_id, message, messageType, 1, timestamp, 0], (err, res) => {
                var sql = "SELECT * FROM socketid WHERE user_id=? and active=1"
                connection.query(sql, [sender_id], (err, res) => {
                    console.log(res);

                    if (res.length > 0) {
                        console.log(jsonobj)

                        io.to(res[0].soc_id).emit(res[0].user_id, jsonobj)

                    }
                })
                var sql = "SELECT * FROM socketid WHERE user_id=? and active=1"
                connection.query(sql, [receiver_id], (err, res) => {
                    console.log(res)

                    if (res.length > 0) {
                        io.emit(receiver_id, jsonobj)

                    }
                })
                io.emit(connection_id, jsonobj)

            })
            return resolve(jsonobj)
        })



    })
}



router.post('/send/:user_id', async (req, res) => {

    try {


        if (req.session.DOC) {
            receiver_id = req.body.reciver
            connection_id = req.params.user_id
            var io = req.app.get('socketio');
            var id = req.app.get('socketid')
            timestamp = Date.now()
            message_id = randomnumbers(13)
            message = req.body.message
            messageType = req.body.messageType
            sender_id = req.session?.USER?.user_id ?? req.session?.DOCSTAFF?.user_id ?? req.session?.DOC?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id

            let socketmessage = await messageSocket(receiver_id, connection_id, timestamp, message_id, sender_id, message, messageType, io);
            res.status(200).send(socketmessage);

        }
        else {
            receiver_id = req.body.reciver
            connection_id = req.params.user_id
            var io = req.app.get('socketio');
            var id = req.app.get('socketid')
            timestamp = Date.now()
            message_id = randomnumbers(13)
            message = req.body.message
            messageType = req.body.messageType
            sender_id = req.session?.USER?.user_id ?? req.session?.DOCSTAFF?.user_id ?? req.session?.DOC?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id

            let socketmessage = await messageSocket(receiver_id, connection_id, timestamp, message_id, sender_id, message, messageType, io);
            res.status(200).send(socketmessage);
        }

    }
    catch (error) {

        res.status(400).send(error);
    }

    /*

    receiver_id = req.body.reciver
    connection_id = req.params.user_id
    var io = req.app.get('socketio');
    var id = req.app.get('socketid')
    timestamp = Date.now()
    message_id = randomnumbers(13)
    sender_id = req.session?.USER?.user_id ?? req.session?.DOCSTAFF?.user_id ?? req.session?.DOC?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id
    var jsonobj = {}
    jsonobj['connection_id'] = connection_id
    jsonobj['message'] = req.body.message
    jsonobj['messageType'] = req.body.messageType
    jsonobj['timestamp'] = timestamp
    var sql = "INSERT INTO message(message_id,receiver_id,connection_id,sender_id,message,messageType,status,timestamp,readstatus) VALUES(?,?,?,?,?,?,?,?,?)"
    connection.query(sql, [message_id, receiver_id, connection_id, sender_id, req.body.message, req.body.messageType, 1, timestamp, 0], (err, res) => {

        var sql = "SELECT * FROM socketid WHERE user_id=? and active=1"
        connection.query(sql, [sender_id], (err, res) => {

            if (res.length > 0) {

                io.to(res[0].soc_id).emit(res[0].user_id, jsonobj)

            }
        })

        var sql = "SELECT * FROM socketid WHERE user_id=? and active=1"
        connection.query(sql, [receiver_id], (err, res) => {

            if (res.length > 0) {
                io.emit(receiver_id, jsonobj)

            }
        })
        io.emit(connection_id, jsonobj)

    })
    res.send(jsonobj)*/
});



reterivemessage = user_id => {

    return new Promise(async (resolve, reject) => {

        let jsonobj
        var sql = "SELECT DISTINCT sender_id, connection_id,doctorimage FROM message LEFT JOIN Profileinfo ON message.sender_id = Profileinfo.user_id WHERE message.receiver_id=?";

        let chat = await connection.query(sql, [user_id, user_id], (err, resulted) => {

            if (err) return reject(err);
            if (!resulted) return reject('not data');
            var result = []
            if (resulted.length > 0) {

                resulted.forEach(async (results, index) => {

                    var sql = "SELECT * FROM message WHERE connection_id=?  AND status=1 ORDER BY timestamp DESC LIMIT 1"
                    connection.query(sql, [results.connection_id], (err, res2) => {

                        var sql = "select  name,email from signup where user_id=?";
                        connection.query(sql, [results.sender_id], (err, signres) => {
                            res2.forEach(async (res3, index) => {
                                jsonobj = { 'receiver_id': res2[index].receiver_id, 'center_id': res2[index].sender_id, 'connection_id': res2[index].connection_id, 'image': results.doctorimage }
                                jsonobj['message'] = res2[index].message
                                jsonobj['messageType'] = res2[index].messageType
                                jsonobj['timestamp'] = res2[index].timestamp
                                jsonobj['readstatus'] = res2[index].readstatus
                                jsonobj['name'] = signres[index]?.name ?? ''
                                jsonobj['email'] = signres[index]?.email ?? ''
                                result.push(jsonobj)
                            })
                            if (index === resulted.length - 1) {
                                return resolve(result)
                            }
                        })
                    })
                })
            }
        })
    })
}




router.get('/retrive', async (req, res) => {

    try {



        const user_id = req.session?.USER?.user_id ?? req.session?.DOC_ID ?? req.session?.DOC?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id

        let retrive = await reterivemessage(user_id);

        res.status(200).send(retrive);
    }


    catch (error) {

        res.status(400).send(error);
    }
})

socketRetrive = (id) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM message WHERE connection_id=? ORDER BY timestamp DESC"
        connection.query(sql, [id, id], (err, result) => {
            return resolve(result)
        })

    })
}

router.get('/retrive/:id', async (req, res) => {
    try {
        id = req.params.id

        let retrivesocket = await socketRetrive(id);
        res.status(200).send(retrivesocket);

    }
    catch (error) {
        res.status(400).send(error);
    }

    /*
    id = req.params.id
    var sql = "SELECT * FROM message WHERE connection_id=? ORDER BY timestamp DESC"
    connection.query(sql, [id, id], (err, result) => {
        res.send(result)
    })
*/

})





/*
router.get('/retrive', async (req, res) => {
    var result = []
    let jsonobj
    var sql = "SELECT DISTINCT receiver_id,center_id,doctorimage FROM message LEFT JOIN Profileinfo ON message.receiver_id = Profileinfo.user_id";
    const user_id = req.session?.USER?.user_id ?? req.session?.DOCSTAFF?.user_id ?? req.session?.DOC_ID?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id ?? ''
    connection.query(sql, [user_id, user_id], (err, results) => {
        results.forEach(async results => {
            jsonobj = { 'receiver_id': results.receiver_id, 'center_id': results.center_id, 'image': results.doctorimage }
            var sql = "SELECT * FROM message WHERE receiver_id=? AND status=1 ORDER BY timestamp DESC LIMIT 1" 
           results = await connection.query(sql, results.receiver_id, (err, res2) => {
                jsonobj['chat'] = res2[0]
               
                result.push(jsonobj)
 
            })
 
        })
        res.status(200).send(result)
    })
 
})*/

updateSocket = (login_time, user_id, soc_id) => {
    return new Promise((resolve, reject) => {
        var sql = "UPDATE socketid set active=0,logouttime=? where USER_ID=? and active=1"
        connection.query(sql, [login_time, user_id], (err, res) => {
            let sql = "INSERT INTO socketid(user_id,soc_id,active,logintime,logouttime) VALUES(?,?,?,?,?)"
            connection.query(sql, [user_id, soc_id, 1, login_time, 1], (err, res) => {

                return resolve(res);
            })
        })

    })

}
router.post('/update', async (req, res) => {


    try {
        var soc_id = req.app.get('socketid')
        login_time = Date.now()

        const user_id = req.session?.USER?.user_id ?? req.session?.DOCSTAFF?.user_id ?? req.session?.DOC?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id ?? ''
        if (user_id) {
            let socketupdate = await updateSocket(login_time, user_id, soc_id);
            res.status(200).send({ message: 'sadsahjvhjv' })

        }
        else {

            res.status(400).send({ message: 'not allowed' });
        }

    }
    catch (error) {

        res.status(400).send(error);
    }
    /*
    var soc_id = req.app.get('socketid')
    login_time = Date.now()

    const user_id = req.session?.USER?.user_id ?? req.session?.DOCSTAFF?.user_id ?? req.session?.DOC?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id ?? ''
    if (user_id) {
        var sql = "UPDATE socketid set active=0,logouttime=? where USER_ID=? and active=1"
        connection.query(sql, [login_time, user_id], (err, res) => {
            let sql = "INSERT INTO socketid(user_id,soc_id,active,logintime,logouttime) VALUES(?,?,?,?,?)"
            connection.query(sql, [user_id, soc_id, 1, login_time, 1], (err, res) => {

            })
        })
    }

    res.status(200).send({ message: 'sadsa' })*/
})

socketVideo = (user_id, message_id, sender_id, timestamp, io) => {
    return new Promise((resolve, reject) => {
        var jsonobj
        var sql = "select email,name from signup where user_id=?";
        connection.query(sql, [sender_id], (err, signres) => {


            var sql = "INSERT INTO message(message_id,sender_id,receiver_id,message,messageType,status,timestamp,readstatus) VALUES(?,?,?,?,?,?,?,?)";
            connection.query(sql, [message_id, sender_id, user_id, 'video-call' ?? '', 'video', 1, timestamp, 0], (err, res) => {
                var sql = "SELECT doctorimage FROM Profileinfo WHERE user_id=?"
                connection.query(sql, [user_id], (err, res) => {
                    var sql = "select count(readstatus) as count from message where readstatus=0";
                    connection.query(sql, (err, res) => {




                        jsonobj.count = res[0].count


                    })


                    jsonobj = { email: signres[0]?.email ?? '', name: signres[0]?.name ?? '', profile_image: res[0]?.doctorimage ?? '', from: sender_id, message_id: message_id, message: 'video-call', type: 'video', timestamp: timestamp, peer_id: peer_id }
                    var sql = "SELECT * FROM socketid WHERE user_id=? and active=1"
                    console.log(jsonobj)
                    connection.query(sql, [user_id], (err, res) => {

                        console.log(res.length)

                        if (res.length > 0) {
                            io.emit(user_id, jsonobj)
                        }
                    })
                    return resolve(jsonobj);
                })




            })

        })

        return resolve(jsonobj)


    })

}
router.post('/video', async (req, res) => {

    try {
        user_id = req.body.reciver_id
        var io = req.app.get('socketio');
        var id = req.app.get('socketid')
        peer_id = req.body.peer_id
        timestamp = Date.now()
        message_id = randomnumbers(13)
        sender_id = req.session?.USER?.user_id ?? req.session?.DOCSTAFF?.user_id ?? req.session?.DOC?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id

        let videosocket = await socketVideo(user_id, message_id, sender_id, timestamp, io);
        res.status(200).send(videosocket);

    }
    catch (error) {

        res.status(400).send(error);
    }
    /*

    user_id = req.body.reciver_id
    var io = req.app.get('socketio');
    var id = req.app.get('socketid')
    peer_id = req.body.peer_id
    timestamp = Date.now()
    message_id = randomnumbers(13)
    sender_id = req.session?.USER?.user_id ?? req.session?.DOCSTAFF?.user_id ?? req.session?.DOC?.user_id ?? req.session?.ADMIN?.user_id ?? req.session?.SUPER_ADMIN?.user_id
    var jsonobj
    var sql = "INSERT INTO message(message_id,sender_id,receiver_id,message,messageType,status,timestamp,readstatus) VALUES(?,?,?,?,?,?,?,?)"
    connection.query(sql, [message_id, sender_id, user_id, 'video-call' ?? '', 'video', 1, timestamp, 0], (err, res) => {
    
        var sql = "SELECT doctorimage FROM Profileinfo WHERE user_id=?"
        connection.query(sql, [user_id], (err, res) => {


            var sql = "select count(readstatus) as count from message where readstatus=0";
            connection.query(sql, (err, res) => {
           

                jsonobj.count = res[0].count
            })
            jsonobj = { profile_image: res[0]?.doctorimage ?? '', from: sender_id, message_id: message_id, message: 'video-call', type: 'video', timestamp: timestamp, peer_id: peer_id }
            var sql = "SELECT * FROM socketid WHERE user_id=? and active=1"
            connection.query(sql, [user_id], (err, res) => {


     
                if (res.length > 0) {
                    io.emit(user_id, jsonobj)
                }
            })
        })
    })
    res.send(jsonobj)*/


})
module.exports = router;
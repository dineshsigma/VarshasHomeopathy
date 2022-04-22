let { connection } = require('../db');

let staffvalidation = ((req, res, next) => {
    const email = req.body.email;

    var sql = "select * from Staff where email=?";
    connection.query(sql, email, (error, results) => {
        if (results.length > 0) {

            res.status(400).send('THIS EMAIL ALREADY ENTER')

        }
        else {
            next();
        }

    })

})


module.exports = staffvalidation
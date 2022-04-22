
let express = require('express');
const Joi = require('joi');
let router = express.Router();
let { connection } = require('../db.js');
let staffvalidation = require('../validation/staffvalidation')
let { staffemail } = require('../validation/signvalidation')
let { randomnumbers } = require('../randomgenerator/randomnumber')
let { hashSync } = require('bcrypt');
let { mailer } = require('../transporter');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//-------------------------fetch staff table---------------------------------------//
Stafffetch = (doc_id) => {
    return new Promise((resolve, reject) => {

        var sql = "select s.sta_id,d.deptname,c.chambarname,s.name,s.designation,s.email,s.phonenumber,s.doj from Staff s,Department d,Chambar c where s.deptname=d.dept_id and s.cha_id=c.cha_id and s.isActive=1 and s.doc_id=?";
        connection.query(sql, [doc_id], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }
        })

    })
}


router.get('/fetch', async (req, res) => {

    try {
        if (req.session.DOC) {
            doc_id = req.session.DOC.user_id
            const fetstaf = await Stafffetch(doc_id);
            res.status(200).send(fetstaf);

        }
        else if (req.session.DOCSTAFF) {
            doc_id = req.session.DOC_ID
            const fetstaf = await Stafffetch(doc_id);
            res.status(200).send(fetstaf);
        }


    }
    catch (error) {

        res.status(400).send(error);
    }
})

//----------------------------------fetch staff bty id----------------------------------//

StafffetchById = (sta_id) => {
    return new Promise((resolve, reject) => {
        var sql = "select * from Staff where sta_id=?";
        connection.query(sql, [sta_id], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }
        })
    })
}

router.get('/fetch/:sta_id', async (req, res) => {

    let sta_id = req.params.sta_id;

    try {
        let stafet = await StafffetchById(sta_id);
        res.status(200).send(stafet);

    }
    catch (error) {

        res.status(400).send(error);
    }
})
router.get("/schedule/:id", async (req, res) => {

    res.send({ message: "data" }).status(200)
})
router.post('/schedule/set/:id', async (req, res) => {

    res.send({ message: "set schedule" })
})


//---------------------------------------stafff insert----------------------------------------------

const schema = Joi.object().keys({
    sta_id: Joi.string(),
    cha_id: Joi.string().required(),
    department: Joi.string().required(),
    name: Joi.string().required(),
    designation: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string(),
    date: Joi.date(),
    phonenumber: Joi.number()
})

router.post('/insert/:doc_id', staffemail, staffvalidation, async (req, res) => {



    const { error } = schema.validate(req.body);
    if (error) {

        res.status(400).send(error);
    }
    else {
        try {

            if (req.session.DOC) {
                const sta_id = randomnumbers(13)
                cha_id = req.body.cha_id
                deptname = req.body.department
                doc_id = req.session.DOC.user_id
                let name = req.body.name
                designation = req.body.designation
                email = req.body.email
                doj = req.body.date
                phonenumber = req.body.phonenumber
                password = randomnumbers(10) + process.env.PEPPER;
                isActive = req.body.isActive || 1
                let insstaff = await staffInsert(sta_id, cha_id, deptname, doc_id, name, designation, email, password, doj, phonenumber, isActive);
                res.status(200).send(insstaff);
            }
            else {
                res.send({ message: "NOT ALLOWED" }).status(403)
            }



        }
        catch (error) {
            res.status(400).send(error)
        }
    }
})
RollBased = (sta_id, doc_id, isActive, permission) =>
    new Promise((resolve, reject) => {
        data = [sta_id, doc_id, isActive, permission]
        let sql = "insert into Rollbased (sta_id, doc_id,isActive, permission)values(?,?,?,?)"
        connection.query(sql, data, (err, results) => {

        })
    })
staffInsert = (sta_id, cha_id, deptname, doc_id, name, designation, email, password, doj, phonenumber, isActive) => {
    return new Promise((resolve, reject) => {

        var sql = "insert into Staff(sta_id,cha_id,deptname,doc_id,name,designation,email,password,doj,phonenumber,isActive) values(?,?,?,?,?,?,?,?,?,?,?)";
        connection.query(sql, [sta_id, cha_id, deptname, doc_id, name, designation, email, password, doj, phonenumber, isActive], (error, results) => {
            if (error) {

                return reject(error);

            }
            else {
                var sql = "select * from Staff   where sta_id=?";
                //var sql="  select *from  Staff where sta_id=(SELECT LAST_INSERT_ID())";
                connection.query(sql, [sta_id], (error, results) => {

                    if (error) {
                        return reject(error);
                    }
                    else {

                        const isActive = 1,
                            permission = " NO_VIEW";
                        roll_id = randomnumbers(10);
                        var sql = "insert into Rollbased(roll_id,doc_id,user_id,sta_id,isActive,permission) values(?,?,?,?,?,?)";
                        connection.query(sql, [roll_id, results[0].doc_id, doc_id, results[0].sta_id, isActive, permission], (error, results1) => {
                            if (error) {
                                return reject(error);
                            }
                            else {

                                accessLevel = 1,
                                    verified = 1

                                let hashedpassword = hashSync(results[0].password, 10);

                                var sql = "insert into signup(user_id,name,email,password,telephone,accessLevel,verified) values(?,?,?,?,?,?,?)";
                                connection.query(sql, [results[0].sta_id, results[0].name, results[0].email, hashedpassword, results[0].phonenumber, accessLevel, verified], (error, results2) => {
                                    if (error) {

                                        return reject(error);
                                    }
                                    else {

                                        const user = { email, password };

                                        const token = jwt.sign(user, process.env.TOKENREGISTER,

                                            { expiresIn: '1day' }
                                        );
                                        const passwordgenerate = results[0].password


                                        var mailOptions = {
                                            from: process.env.EMAIL,
                                            to: email,
                                            subject: 'Registration',
                                            template: 'staff',
                                            context: {
                                                password: passwordgenerate,
                                            },
                                        };
                                        mailer.sendMail(
                                            mailOptions,
                                            function (error, info) {
                                                if (error) {

                                                    return reject(error);
                                                } else {
                                                }
                                            }
                                        );
                                        const response = {
                                            message: "successfully",

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


///-----------------------------update stafff---------------------------------------//




staffUpdate = (sta_id, cha_id, deptname, name, designation, email, phonenumber) => {
    return new Promise((resolve, reject) => {
        var sql = "update Staff set cha_id=?,deptname=?,name=?,designation=?,email=?,phonenumber=? where sta_id=? ";
        let data = [cha_id, deptname, name, designation, email, phonenumber, sta_id];

        connection.query(sql, data, (error, results) => {
            if (error) {

                return reject(error);
            }
            else {

                return resolve(results);
            }
        })

    })

}

router.put('/update/:id', async (req, res) => {
    /*
        let { error } = schema.validate(req.body);
        if (error) {
         
    
            res.status(400).send(error);
        }*/
    // else {
    try {


        let sta_id = req.body.sta_id,
            cha_id = req.body.cha_id,
            deptname = req.body.department,
            // user_id=req.body.user_id,
            name = req.body.name,
            designation = req.body.designation,
            email = req.body.email,
            phonenumber = req.body.phonenumber
        //doj = req.body.date


        const updstaff = await staffUpdate(sta_id, cha_id, deptname, name, designation, email, phonenumber);
        res.status(200).send(updstaff);

    }
    catch (error) {
        res.status(400).send(error);
    }
    //}

})


StaffDel = (doc_id) => {
    return new Promise((resolve, reject) => {
        var sql = "update Staff set isActive=0 where doc_id=?";

        connection.query(sql, [doc_id], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }

        })
    })
}

router.delete('/delete/:id', async (req, res) => {
    try {
        const doc_id = req.params.id;
        let stafdel = await StaffDel(doc_id);
        res.status(200).send(stafdel);

    }
    catch (error) {
        res.status(400).send(error);
    }
})





module.exports = router;

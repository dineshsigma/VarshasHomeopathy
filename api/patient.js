const express = require('express');
const { connection } = require('../db');
let router = express.Router();
let { randomnumbers } = require('../randomgenerator/randomnumber')
let Joi = require('joi');
const {
    genSaltSync,
    hashSync,
    compareSync,
  } = require('bcrypt');
  require('dotenv').config();
let { mailer } = require('../transporter');
let jwt = require('jsonwebtoken');



PatientFetch = () => {
    return new Promise((resolve, reject) => {
        var sql = "select * from Patient";
        connection.query(sql, (error, results) => {
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
        const fetchpatient = await PatientFetch();
        res.status(200).send(fetchpatient)

    }
    catch (error) {
        res.status(400).send(error)

    }
})

patientFetchById = (pat_id) => {
    return new Promise((resolve, reject) => {
        var sql = "select * from patient where pat_id=?";
        connection.query(sql, [pat_id], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }
        })
    })
}


router.get('/fetch/:pat_id', async (req, res) => {
    try {
        const pat_id = req.params.pat_id;
        const fetpat = await patientFetchById(pat_id);
        res.status(200).send(fetpat)

    }
    catch (error) {
        res.status(400).send(error);
    }
})

getpatnumber=(phonenumber)=>{

    return new Promise((resolve,reject)=>{
        var sql="select name,email from patient where phonenumber=?";
        connection.query(sql,[phonenumber],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                if(results.length >0){
                    let response={
                        "name":results[0].name,
                        "email":results[0].email,
                        "exists":1
                    }
                    return resolve(response)
                    

                }
                else{
                    let response={
                        "exists":0
                    }
                    return resolve(response)

                }
            }

        })

    })
}










router.get('/patientbynumber/:id', async (req,res)=>{
    try{
        let phonenumber=req.params.id

        let getname= await getpatnumber(phonenumber);
        res.status(200).send(getname)

    }
    catch(error){
        res.status(400).send(error)
    }

})

patientDelete = (pat_id) => {
    return new Promise((resolve, reject) => {
        var sql = "select * from Appointment where user_id=?";
        connection.query(sql, [pat_id], (error, results) => {
            if (results.length > 0) {
                return reject('delete data in appointment table')

            }
            else {
                var sql = "delete from Patient where pat_id=?";
                connection.query(sql, [pat_id], (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    else {
                        return resolve(results);
                    }
                })

            }
        })
    })
}

router.delete('/delete/:pat_id', async (req, res) => {

    try {
        let pat_id = req.params.pat_id;

        let delpatient = await patientDelete(pat_id);
        res.status(200).send(delpatient);

    }
    catch (error) {

        res.status(400).send(error);

    }
})


patientInsert = (pat_id, doc_id, user_id, name, email, phonenumber, gender, lastvisited, nextvisited, status) => {
    return new Promise((resolve, reject) => {
var sql="select * from Patient where email=?";
connection.query(sql,[email],(err,results)=>{
    if(err){
        return reject(err)
    }
    if(results.length > 0){
       var sql="update Patient set name=?,user_id=?,phonenumber=?,gender=?,lastvisited=?,nextvisited=?,status=? where email=?";
       connection.query(sql,[name,user_id,phonenumber,gender,lastvisited,nextvisied,status,email],(err,results1)=>{


       })

    }
    else{
       
        var sql = "insert into Patient(pat_id,doc_id,user_id,name,email,phonenumber,gender,lastvisited,nextvisited,status) values(?,?,?,?,?,?,?,?,?,?)";
        connection.query(sql, [pat_id, doc_id, user_id, name, email, phonenumber, gender, lastvisited, nextvisited, status], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                
                const userpassword=randomnumbers(10);
                const pepperpassword=userpassword+process.env.PEPPER;
                const hashpassword=hashSync(pepperpassword,10);
                const date=Date.now();
                
                    console.log(userpassword);
                    
                    console.log(hashpassword);
                    let user = { email, userpassword };
                    let token = jwt.sign(user, process.env.TOKENREGISTER, { expiresIn: '1day' });
                    let password = userpassword;
                    var mailOptions = {
                      from: process.env.EMAIL,
                      to: email,
                      subject: 'USER REGISTER',
                      template: 'staff',
                      context: {
                        password: password
                      }
                    };
                    mailer.sendMail(mailOptions, function (error, info) {
                      if (error) {
                        return reject(error);
                      }
                      else {
            
                      }
                    })
                    const response={
                        message:'user register success'
                    }
                  var sql="select * from signup where email=?";
                  connection.query(sql,[email],(err,results4)=>{
                      console.log(err);
                      if(results4.length > 0){
                          console.log(response);
                          return resolve(response);


                      }
                      else{
                          var sql="insert into signup(user_id,name,email,password,telephone,accessLevel,verified,signupdate) values(?,?,?,?,?,?,?,?)";
                          connection.query(sql,[pat_id,name,email,hashpassword,phonenumber,0,0,date],(err,signins)=>{
                              console.log(err);
                            return resolve(response);

                          })
                      }

                  })



               
               
            }
        })

    }
})



    })

}


let schema = Joi.object().keys({
    user_id: Joi.string(),

    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phonenumber: Joi.number().min(10).required(),
    LAST_VISITED: Joi.string().required(),
    NEXT_VISIT: Joi.string().required(),
    status: Joi.number().required(),
    gender: Joi.string()
})

router.post('/insert', async (req, res) => {
    console.log(req.body);

    let { error } = schema.validate(req.body);
    if (error) {


        res.status(400).send(error.message);
    }
    else {

        try {

            if (req.session.DOC) {
                const pat_id = randomnumbers(20),
                    name = req.body.name,
                    user_id = req.body.user_id,
                    doc_id = req.session.DOC.user_id,
                    email = req.body.email.trim(),
                    phonenumber = req.body.phonenumber,
                    gender = req.body.gender,
                    lastvisited = req.body.LAST_VISITED,
                    nextvisited = req.body.NEXT_VISIT,
                    status = req.body.status || 0
                const inspatient = await patientInsert(pat_id, doc_id, user_id, name, email, phonenumber, gender, lastvisited, nextvisited, status);
                res.status(200).send(inspatient)
            }
            else if (req.session.DOCSTAFF) {
                const pat_id = randomnumbers(20),
                    name = req.body.name,
                    user_id = req.body.user_id,
                    doc_id = req.session.DOC_ID,
                    email = req.body.email.trim(),
                    phonenumber = req.body.phonenumber,
                    gender = req.body.gender,
                    lastvisited = req.body.LAST_VISITED,
                    nextvisited = req.body.NEXT_VISIT,
                    status = req.body.status || 0
                const postpatient = await patientInsert(pat_id, doc_id, user_id, name, email, phonenumber, gender, lastvisited, nextvisited, status);
                res.status(200).send(postpatient)

            }
            else {
                res.status(403).send({ message: "NOT ALLOWED" })
            }

        }
        catch (error) {
            res.status(400).send(error);
        }
    }
})

updatePatient = (pat_id, user_id, name, email, phonenumber, gender, lastvisited, nextvisit, status) => {
    return new Promise((resolve, reject) => {
        var sql = "update Patient set user_id=?, name=?,email=?,gender=?,phonenumber=?,lastvisited=?,nextvisited=?,status=? where pat_id=?";
        connection.query(sql, [user_id, name, email, gender, phonenumber, lastvisited, nextvisit, status, pat_id], (error, results) => {
            if (error) {

                return reject(error);
            }
            else {
                return resolve(results);
            }

        })
    })
}


let schemaupdate = Joi.object().keys({
    user_id: Joi.string(),
    pat_id: Joi.string(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phonenumber: Joi.number().min(10).required(),
    lastvisited: Joi.string().required(),
    nextvisit: Joi.string().required(),
    status: Joi.number().required(),
    gender: Joi.string()
})

router.put('/update', async (req, res) => {

    let { error } = schemaupdate.validate(req.body);
    if (error) {

        res.status(400).send(error);
    }
    else {

        try {
            const pat_id = req.body.pat_id,
                user_id = req.body.user_id,
                name = req.body.name,
                email = req.body.email,
                phonenumber = req.body.phonenumber,
                gender = req.body.gender,
                lastvisited = req.body.lastvisited,
                nextvisit = req.body.nextvisit,
                status = req.body.status

            const update = await updatePatient(pat_id, user_id, name, email, phonenumber, gender, lastvisited, nextvisit, status);
            res.status(200).send(update)

        }
        catch (error) {


            res.status(400).send(error);

        }
    }
})



Userdistinct=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select distinct user_id from Booking";
        connection.query(sql,(err,results)=>{
            if(err){
                return reject(err);
            }
            else{
                return resolve(results);
            }
        })
    })
}

router.get('/distinctuser',async (req,res)=>{
    try{
        if(req.session.DOC){
        const disuser=await Userdistinct();
        res.status(200).send(disuser);
        }
        else{
            res.status(400).send('not allowed')
        }

    }
    catch(error){
        res.status(400).send(error);

    }
})

doctorAddpatient=()=>{
    return new Promise((resolve,reject)=>{
        
    })
}

router.post('/addpatients',async (req,res)=>{
    try{
        console.log(req.body)

        const doctoradd= await doctorAddpatient();
        res.status(200).send(doctoradd)

    }
    catch(error){
        res.status(400).send(error)
    }
})

module.exports = router;
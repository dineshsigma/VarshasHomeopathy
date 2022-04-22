const express = require('express');
const router = express.Router();
const { connection } = require('../db');
const Joi = require('joi');
const fs = require('fs');
const randomintnumbers = require('../randomgenerator/randomnumber')



chambarfetch = doc_id => {
    return new Promise((resolve, reject) => {
        var sql = "select  c.cha_id,d.deptname,c.chambarname,c.title,c.appointmentLimit,c.address from Chambar  c,Department d where d.dept_id=c.deptname AND c.doc_id=?";
        connection.query(sql, doc_id, (error, results) => {
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
            let doc_id = req.session.DOC.user_id
            const chambar = await chambarfetch(doc_id);
            res.status(200).send(chambar)
        }
        else if (req.session.DOCSTAFF) {
            let doc_id = req.session.DOC_ID
            const chambar = await chambarfetch(doc_id);
            res.status(200).send(chambar)

        }

    }
    catch (error) {

        res.status(400).send(error);
    }

})




insertChambar = (cha_id, doc_id, deptname, chambarname, title, appointmentLimit, address) => {
    return new Promise((resolve, reject) => {
        var sql = "insert into Chambar (cha_id,doc_id,deptname,chambarname,title,appointmentLimit,address) values(?,?,?,?,?,?,?)";
        connection.query(sql, [cha_id, doc_id, deptname, chambarname, title, appointmentLimit, address], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }
        })
    })
}


const schema = Joi.object().keys({
    cha_id: Joi.string(),
    chambarname: Joi.string(),
    deptname: Joi.string().required(),

    title: Joi.string().required(),
    appointmentLimit: Joi.number().required(),
    address: Joi.string().required()

})


router.post('/insert', async (req, res) => {



    const { error } = schema.validate(req.body);
    if (error) {


        return res.status(400).send(error);
    }
    else {

        try {
            if (req.session.DOC) {
                const cha_id = req.body.cha_id
                doc_id = req.session.DOC.user_id
                chambarname = req.body.chambarname
                title = req.body.title
                deptname = req.body.deptname
                appointmentLimit = req.body.appointmentLimit
                address = req.body.address
                let chambarins = await insertChambar(cha_id, doc_id, deptname, chambarname, title.toUpperCase(), appointmentLimit, address);
                res.status(200).send(chambarins);

            }
            else if (req.session.DOCSTAFF) {

                let cha_id = req.body.cha_id
                doc_id = req.session.DOC_ID
                chambarname = req.body.chambarname
                title = req.body.title
                appointmentLimit = req.body.appointmentLimit
                address = req.body.address
                deptname = req.body.deptname
                let postchambar = await insertChambar(cha_id, doc_id, deptname, chambarname, title.toUpperCase(), appointmentLimit, address);
                res.status(200).send(postchambar);

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


chambarDelete = (cha_id, doc_id) => {

    return new Promise((resolve, reject) => {
        var sql = "select * from Staff where cha_id=? AND doc_id=?";
        connection.query(sql, [cha_id, doc_id], (error, results) => {

            if (results.length > 0) {
                return reject('delete  data in staff table ');
            }
            else {
                var sql = "delete from Chambar where cha_id=? AND doc_id=?";
                connection.query(sql, [cha_id, doc_id], (error, results) => {
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



router.delete('/delete/:cha_id', async (req, res) => {
    try {

        if (req.session.DOC) {
            const cha_id = req.params.cha_id
            let doc_id = req.session.DOC.user_id
            const chamdel = await chambarDelete(cha_id, doc_id);
            res.status(200).send(chamdel);
        }
        else if (req.session.DOCSTAFF) {
            const cha_id = req.params.cha_id
            let doc_id = req.session.DOC_ID
            const chamdel = await chambarDelete(cha_id, doc_id);
            res.status(200).send(chamdel);

        }
        else {
            res.send({ message: "NOT ALLOWED LOGIN AGAIN" }).status(403)
        }

    }
    catch (error) {

        res.status(400).send(error);
    }
})

fetchById = (cha_id, doc_id) => {
    return new Promise((resolve, reject) => {
        var sql = "select * from Chambar where cha_id=? AND doc_id=?";
        connection.query(sql, [cha_id, doc_id], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }

        })
    })
}

router.get('/fetch/:cha_id', async (req, res) => {
    try {
        if (req.session.DOC) {
            const cha_id = req.params.cha_id;
            let doc_id = req.session.DOC.user_id
            const fetchChar = await fetchById(cha_id, doc_id);
            res.status(200).send(fetchChar);

        }
        else if (req.session.DOC_ID) {
            const cha_id = req.params.cha_id;
            let doc_id = req.session.DOC_ID
            const fetchChar = await fetchById(cha_id, doc_id);
            res.status(200).send(fetchChar);
        }
        else {
            res.send({ message: "NOT ALLOWED" }).status(403)
        }


    }
    catch (error) {
        res.status(400).send(error);
    }
})


const schema1 = Joi.object().keys({
    cha_id: Joi.number(),
    chambarname: Joi.string(),
    deptname: Joi.number().required(),

    title: Joi.string().required(),
    appointmentLimit: Joi.number().required(),
    address: Joi.string().required()

})


updateChambar = (cha_id, deptname, chambarname, title, appointmentLimit, address, doc_id) => {
    return new Promise((resolve, reject) => {

        var sql = "update Chambar set  deptname=?,chambarname=?,title=?,appointmentLimit=?,address=? where cha_id=? AND doc_id=?";
        let data = [deptname, chambarname, title, appointmentLimit, address, cha_id, doc_id];
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


router.put('/update', async (req, res) => {

    const { error } = schema1.validate(req.body);
    if (error) {

        res.status(400).send(error);
    }
    else {
        try {
            if (req.session.DOC) {
                const cha_id = req.body.cha_id
                deptname = req.body.deptname
                chambarname = req.body.chambarname
                title = req.body.title
                appointmentLimit = req.body.appointmentLimit
                address = req.body.address
                doc_id = req.session.DOC.user_id
                const updatecham = await updateChambar(cha_id, deptname, chambarname, title, appointmentLimit, address, doc_id);
                res.status(200).send(updatecham);
            }
            else if (req.session.DOCSTAFF) {
                const cha_id = req.body.cha_id
                deptname = req.body.deptname
                chambarname = req.body.chambarname
                title = req.body.title
                appointmentLimit = req.body.appointmentLimit
                address = req.body.address
                doc_id = req.session.DOC_ID
                const updatecham = await updateChambar(cha_id, deptname, chambarname, title, appointmentLimit, address, doc_id);
                res.status(200).send(updatecham);
            }
            else {
                res.send({ message: "NOT ALLOWED" })
            }

        }
        catch (error) {

            res.status(400).send(error);


        }
    }
})


chambarName=(searchkey)=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from Chambar where Chambar.chambarname LIKE ?";
        connection.query(sql,searchkey,(error,results)=>{
            if(error){
                return reject(error);
            }
            else{
                return resolve(results);
            }
        })
    })
}

router.get('/searchchambar/:searchkey',async (req,res)=>{
    try{

        searchkey='%'+req.params.searchkey+'%'
        let searchchambar=await chambarName(searchkey);
        res.status(200).send(searchchambar);

    }
    catch(error){
        res.status(400).send(error);

    }
})



module.exports = router;
const express = require('express');
const router = express.Router();
const { connection } = require('../db');
const Joi = require('joi');
let stream=require('stream')





let deptAdmin = () =>
    new Promise((resolve, reject) => {
        var sql = "select * from Department ";
        //var sql="select d.deptname,d.dept_id,n.doctorname from Doctor n,Department d where d.doc_id=n.doc_id";
       /* connection.query(sql, (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }
        })*/

        connection.query(sql).on('error', function(err) {
            console.log(err)
            // Do something about error in the query
          })
          .stream()
          .pipe(new stream.Transform({
            objectMode: true,
            transform: function (row, encoding, callback) {
                console.log(row)
                console.log(encoding)

              // Do something with the row of data
        
              callback();
            }
          }))
          .on('finish', function() {
            connection.end();
          });

    })


let deptFetch = (doc_id) =>
    new Promise((resolve, reject) => {
        var sql = "select * from Department where doc_id=?";
        //var sql="select d.deptname,d.dept_id,n.doctorname from Doctor n,Department d where d.doc_id=n.doc_id";
        connection.query(sql, doc_id, (error, results) => {
            console.log(results.deptname)
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }
        })

    })




router.get('/fetch', async (req, res) => {
    try {
        if (req.session.DOC) {
            let doc_id = req.session.DOC.user_id
            const fetchdep = await deptFetch(doc_id);
            res.status(200).send(fetchdep);
        }
        else if (req.session.DOCSTAFF) {
            let doc_id = req.session.DOC_ID
            const fetchdep = await deptFetch(doc_id);
            res.status(200).send(fetchdep);
        }
        else if(req.session.ADMIN.user_id) {
            let admindept=await deptAdmin();
            res.status(200).send(admindept);
           
        }
        else{
            res.status(403).send({ message: "NOT ALLOWED" })
        }


    }
    catch (error) {
        res.status(400).send(error)
    }
})



fetchDeptById = (dept_id, doc_id) => {
    return new Promise((resolve, reject) => {
        var sql = "select * from Department where dept_id=? and doc_id=?";
        connection.query(sql, [dept_id, doc_id], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);

            }
        })
    })

}

router.get('/fetch/:dept_id', async (req, res) => {
    try {
        if (req.session.DOC) {
            const dept_id = req.params.dept_id
            const doc_id = req.session.DOC.user_id
            const fetchdept = await fetchDeptById(dept_id, doc_id);
            res.status(200).send(fetchdept);
        }
        else if (req.session.DOCSTAFF) {
            const dept_id = req.params.dept_id
            const doc_id = req.session.DOC_ID
            const fetchdept = await fetchDeptById(dept_id, doc_id);
            res.status(200).send(fetchdept);
        }
        else if (req.session.ADMIN) {
            const dept_id = req.params.dept_id
            const doc_id = req.session.ADMIN.user_id
            const fetchdept = await fetchDeptById(dept_id, doc_id);
            res.status(200).send(fetchdept);
        }
        else {
            res.status(403).send({ message: "NOT ALLOWED" })
        }


    }
    catch (error) {
        res.status(400).send(error);

    }

})


const schema = Joi.object().keys({
    deptname: Joi.string().required(),
    dept_id: Joi.number()

})

insertDept = (deptname, doc_id) => {
    return new Promise((resolve, reject) => {
        var sql = "insert into Department(deptname,doc_id) values(?,?)";
        connection.query(sql, [deptname, doc_id], (error, results) => {
            if (error) {
                return reject(error);

            }
            else {
                return resolve(results);

            }

        })

    })
}
let department = require('../validation/department')

router.post('/insert', department, async (req, res) => {
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).send(error);
    }
    else {
        try {
            if (req.session.DOC) {

                const doc_id = req.session.DOC.user_id

                deptname = req.body.deptname
                const postdept = await insertDept(deptname[0].toUpperCase() + deptname.slice(1).toLowerCase(), doc_id);
                res.status(202).send(postdept)
            }
            else if (req.session.DOCSTAFF) {
                const doc_id = req.session.DOC_ID
                deptname = req.body.deptname
                const postdept = await insertDept(deptname[0].toUpperCase() + deptname.slice(1).toLowerCase(), doc_id);
                res.status(202).send(postdept)
            }

            else if (req.session.ADMIN) {
                const doc_id = req.session.ADMIN.user_id
                deptname = req.body.deptname
                const postdept = await insertDept(deptname[0].toUpperCase() + deptname.slice(1).toLowerCase(), doc_id);
                res.status(202).send(postdept)

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

deptDeleteById = (dept_id, doc_id) => {
    return new Promise((resolve, reject) => {
        var sql = "select * from Chambar where deptname=? AND doc_id=?";
        connection.query(sql, [dept_id, doc_id], (error, results) => {

            if (results.length > 0) {
                return reject('Delete data in chambar table');

            }
            else {
                var sql = "delete from  Department where dept_id=? ";
                connection.query(sql, [dept_id], (error, results) => {
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

router.delete('/delete/:dept_id', async (req, res) => {
    try {
        if (req.session.DOC) {
            const dept_id = req.params.dept_id;
            let doc_id = req.session.DOC.user_id
            const deldept = await deptDeleteById(dept_id, doc_id);
            res.status(200).send(deldept);
        }
        else if (req.session.DOCSTAFF) {
            const dept_id = req.params.dept_id
            let doc_id = req.session.DOC_ID
            const deldept = await deptDeleteById(dept_id, doc_id);
            res.status(200).send(deldept);
        }
        else if (req.session.ADMIN) {
            const dept_id = req.params.dept_id
            let doc_id = req.session.ADMIN.user_id
            const deldept = await deptDeleteById(dept_id, doc_id);
            res.status(200).send(deldept);
        }
        else {
            res.status(403).send({ message: "NOT ALLOWED" })
        }

    }
    catch (error) {
        res.status(400).send(error);

    }
})

deptUpdate = (dept_id, deptname, doc_id) => {
    return new Promise((resolve, reject) => {
        var sql = "update Department set  deptname=? where dept_id=? and doc_id=?";
        connection.query(sql, [deptname, dept_id, doc_id], (error, results) => {
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
    const { error } = schema.validate(req.body);
    if (error) {

        res.status(400).send(error);
    }
    else {
        try {

            if (req.session.DOC) {
                const dept_id = req.body.dept_id
                deptname = req.body.deptname
                doc_id = req.session.DOC.user_id
                const updatedept = await deptUpdate(dept_id, deptname[0].toUpperCase() + deptname.slice(1).toLowerCase(), doc_id);
                res.status(200).send(updatedept);

            }
            else if (req.session.DOCSTAFF) {
                const dept_id = req.body.dept_id
                deptname = req.body.deptname
                doc_id = req.session.DOC_ID
                const updatedept = await deptUpdate(dept_id, deptname[0].toUpperCase() + deptname.slice(1).toLowerCase(), doc_id);
                res.status(200).send(updatedept);


            }
            else if (req.session.ADMIN) {
                const dept_id = req.body.dept_id
                deptname = req.body.deptname
                doc_id = req.session.ADMIN.user_id
                const updatedept = await deptUpdate(dept_id, deptname[0].toUpperCase() + deptname.slice(1).toLowerCase(), doc_id);
                res.status(200).send(updatedept);


            }
            else {
                res.status(403).send({ message: "NOT ALLOWEED" })
            }


        }
        catch (error) {
            res.status(400).send(error)
        }
    }
})


router.get('/list', (req, res) => {
    var sql="select count() from Department";

   // var sql = " show tables  where Tables_in_doctwapp NOT LIKE  'do%' and Tables_in_doctwapp NOT LIKE 's%'";
    connection.query(sql, (error, results) => {
        if (error) {
            res.status(400).send(error);
        }
        else {

            console.log(results.deptname)
            res.status(200).send(results)
        }
    })
})

module.exports = router;

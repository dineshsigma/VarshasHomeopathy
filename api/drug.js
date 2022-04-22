let express = require('express');
let router = express.Router();

let { connection } = require('../db');

let drugname=require('../validation/drugvalidation')

drugsFetch = () => {
    return new Promise((resolve, reject) => {
        var sql = "select * from Drug";
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

router.get('/drug', async (req, res) => {
    try {
        let fetchdrugs = await drugsFetch();
        res.status(200).send(fetchdrugs);

    }
    catch (error) {
        res.status(400).send(error);
    }
})

router.get('/drug/:drug_id', async (req, res) => {
    try {
        let drug_id = req.params.drug_id;
        let fetchBydrug = await drugById(drug_id);
        res.status(200).send(fetchBydrug);

    }
    catch (error) {
        res.status(400).send(error);
    }
})


drugById = (drug_id) => {
    return new Promise((resolve, reject) => {
        var sql = "select * from Drug where drug_id=?";
        connection.query(sql, [drug_id], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }

        })
    })
}

let { randomnumbers } = require('../randomgenerator/randomnumber')

router.post('/drug', drugname,async (req, res) => {
   
    try {
        let drug_id=randomnumbers(10)
        drugname=req.body.drugname
        const uppercaseWords = str => str.replace(/^(.)|\s+(.)/g, c => c.toUpperCase());
        drugname=uppercaseWords(req.body.drugname)

        const insertmed=await  druginsert(drug_id,drugname);
        res.status(200).send(insertmed)

       

    }
    catch (error) {

        res.status(400).send(error);
    }
})


druginsert = (drug_id, drugname) => {
    return new Promise((resolve, reject) => {
        var sql = "insert into Drug(drug_id,drugname) values(?,?)";
        connection.query(sql, [drug_id, drugname], (error, results) => {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(results);
            }

        })

    })

}

router.delete('/drug/:drug_id', async (req, res) => {
   
    try {
        let drug_id = req.params.drug_id;
        let drugdelete = await deleteDrug(drug_id);
        res.status(200).send(drugdelete);

    }
    catch (error) {
        res.status(400).send(error);
    }
})

deleteDrug = (drug_id) => {
    return new Promise((resolve, reject) => {
        var sql = "delete from Drug where drug_id=?";
        connection.query(sql, [drug_id], (error, results) => {
            if (error) {
                return reject(error);

            }
            else {
                return resolve(results);
            }

        })


    })
}


router.put('/drug/:id', async (req, res) => {

    try {
        const drug_id = req.body.id,
            drugname = req.body.drugname
            

        let updatedrug = await drugUpdate(drug_id, drugname);
        res.status(200).send(updatedrug);

    }
    catch (error) {
        res.status(400).send(error);
    }
})

drugUpdate = (drug_id, drugname) => {
    return new Promise((resolve, reject) => {
        var sql = "update Drug set drugname=? where drug_id=?";
        connection.query(sql, [drugname, drug_id], (error, results) => {
            if (error) {
                return reject(error);

            }
            else {
                return resolve(results);
            }

        })
    })

}



searchdrugname=(drugname)=>{
    return new Promise((resolve,reject)=>{
        var sql="select  * from Drug where drugname LIKE ?";
        connection.query(sql,[drugname],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }
        })
    })
}



router.get('/drugsearch/:id',async (req,res)=>{
    try{
        let drugname='%'+req.params.id+'%'
        const serch=await searchdrugname(drugname);
        res.status(200).send(serch)


    }
    catch(error){
        res.status(400).send(error)
    }
})

module.exports = router;
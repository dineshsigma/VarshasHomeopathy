const express=require('express');

let router=express.Router();
let {connection}=require('../db');

let drugname=(req,res,next)=>{
    let drugname=req.body.drugname;
    let sql="select * from Drug where drugname=?";
    connection.query(sql,[drugname],(error,results)=>{
        if(results.length > 0){
            res.status(400).send('DRUG NAME IS ALREADY EXITS')

        }
        else{
            next();
        }

    })

}


module.exports=drugname
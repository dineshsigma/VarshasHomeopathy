const express=require('express');

let router=express.Router();
let {connection}=require('../db');

let department=(req,res,next)=>{
    let deptname=req.body.deptname;
    let sql="select * from Department where deptname=?";
    connection.query(sql,[deptname],(error,results)=>{
        if(results.length > 0){
            res.status(400).send('ENTER ANOTHER DEPARTMENT NAME')

        }
        else{
            next();
        }

    })

}


module.exports=department
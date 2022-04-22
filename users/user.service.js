
const connection=require('../db.js');
module.exports={
  
   
  


getUserByEmail:(email,callback)=>{
  var sql="select * from  signup where email=?";


  connection.query(sql,
    [email],(error,results,fields)=>{

      if(error){
        return callback(error);
      }
      return callback(null,results[0]);
    })
}
}


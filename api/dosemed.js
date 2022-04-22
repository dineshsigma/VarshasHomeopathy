let express=require('express')
let router=express.Router();
let {connection}=require('../db');
let {randomnumbers}=require('../randomgenerator/randomnumber')

//----------------------------------------get dose-------------------------------------------------//



Doseget=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from Dosemed";
        connection.query(sql,(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }
        })
    })
}

router.get('/dose',async (req,res)=>{
    try{

        const getdose= await Doseget();
        res.status(200).send(getdose)

    }
    catch(error){
        res.status(400).send(error)
    }
})


//---------------------------------------------------------insert Dose--------------------------------------------------------//


apidose=(id,Dose)=>{
    return new Promise((resolve,reject)=>{
      
           
               var sql="insert into Dosemed(id,Dose) values(?,?)";
               connection.query(sql,[id,Dose],(err,results)=>{
                   if(err) return reject(err)
                   else return resolve(results)

               })
           
           

       
    })

}

router.post('/dose',async (req,res)=>{
    try{
    let id=randomnumbers(10)
    Dose=req.body.Dose

    const insertDose=await apidose(id,Dose);
    res.status(200).send(insertDose)
    }
    catch(error){
        res.status(400).send(error)
    }
})

delteDosebyid=(id)=>{
    return new Promise((resolve,reject)=>{
        var sql="delete from Dosemed where id=?";
        connection.query(sql,[id],(err,results)=>{
            if(err){
                return reject(err)

            }
            else{
                return resolve(results)
            }
        })
    })
}

router.delete('/dose/:id',async (req,res)=>{
    try{
        const id=req.params.id

        const deletedose= await delteDosebyid(id);
        res.status(200).send(deletedose)

    }
    catch(error){
        res.status(400).send(error)
    }
})


UpdateDoseById=(id,Dose)=>{
    return new Promise((resolve,reject)=>{
        var sql="update Dosemed set  Dose=? where id=?";
        connection.query(sql,[Dose,id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}

router.put('/dose/:id',async (req,res)=>{
    try{
        const id=req.params.id
        Dose=req.body.Dose

        const updatedose= await UpdateDoseById(id,Dose);
        res.status(200).send(updatedose)

    }
    catch(error){
        res.status(400).send(error)
    }
})

module.exports=router
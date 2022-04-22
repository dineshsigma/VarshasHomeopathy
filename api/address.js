const express=require('express');
const router=express.Router();
const{connection}=require('../db');





postaddress=(doc_id,location,add)=>{
    return new Promise((resolve,reject)=>{
        var sql="insert into address(doc_id,location,address) values(?,?,?)";
        connection.query(sql,['qwsrfcsxs',location,add],(error,results)=>{
            if(error){
                return reject(error)
            }
            else{
                return resolve(results)
            }

        })
    })
}



router.post('/address',async (req,res)=>{
    console.log(req.body)
    try{
        let doc_id=req.body.doc_id
        location=req.body.location
        add=req.body.add
        


        const address= await postaddress(doc_id,location,add);
        res.status(200).send(address);

    }
    catch(error){
        console.log(error)
        res.status(400).send(error);

    }
})
updateaddress=(add_id,doc_id,address,location)=>{
    return new Promise((resolve,reject)=>{
        var sql="update address set doc_id=?,address=?,location=? where add_id=?";
        connection.query(sql,[doc_id,address,location,add_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }

        })
    })
}

router.put('/address/:id',async (req,res)=>{
    try{
         let add_id=req.params.id
         doc_id=req.body.doc_id
         address=req.body.address
         location=req.body.location

         const update= await updateaddress(add_id,doc_id,address,location);
         res.status(200).send(update);


    }
    catch(error){
        res.status(400).send(error)
    }
})



getalladdress=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from address";
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




router.get('/address',async (req,res)=>{
    try{
        const getaddress=await getalladdress();
        res.status(200).send(getaddress)

    }
    catch(error){
        res.status(400).send(error)

    }
})




deleteaddress=(ach_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="delete from address where ach_id=?";
        connection.query(sql,[ach_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }
        })

    })
}

router.delete('/address/:id',async (req,res)=>{
    try{
         let ach_id=req.params.id

         let deleteid=await deleteaddress(ach_id);
         res.status(200).send(deleteid)



    }
    catch(error){
        res.status(400).send(error)
    }
})





addressbyid=(ach_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select * from address where add_id=?";
        connection.query(sql,[ach_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results);
            }

        })

    })
}



router.get('/address/:id',async (req,res)=>{
    try{
        let  ach_id=req.params.id


        const getbyid= await addressbyid(ach_id);
        res.status(200).send(getbyid)
    

    }
    catch(error){
        res.status(400).send(error)
    }
})

fetchaddressall=()=>{
    return new Promise((resolve,reject)=>{
        var sql="select c.email,c.number from contact c";
        connection.query(sql,(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                var sql="select a.address from address a";
                connection.query(sql,(err,results1)=>{
                    if(err){
                        return reject(err)
                    }
                    else{
                       let response={
                           "email":results[0].email,
                           "number":results[0].number,
                           "address":results1
                       }
                       return resolve(response)
                    }
                })
            }
        })
    })
}


router.get('/alladdress',async (req,res)=>{
    try{
        const fetchaddress=await fetchaddressall();
        res.status(200).send(fetchaddress)

    }
    catch(error){
        res.status(400).send(error)
    }
   
})
module.exports=router;
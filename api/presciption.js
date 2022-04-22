const express=require('express');
const router=express.Router();
let {connection}=require('../db');
let {randomnumbers}=require('../randomgenerator/randomnumber')


purchasedmed=(pres_id,book_id,medicine_sent,purchasedmedicine)=>{
    return new Promise((resolve,reject)=>{
        if(medicine_sent==1){
            let purchasedarray=JSON.stringify(purchasedmedicine)
            let slots=purchasedarray.replace(/['"]+/g, '')
           
            var sql="insert into presciption(pre_id,book_id,medicine_sent,purchasedmedicine) values(?,?,?,?)";
            connection.query(sql,[pres_id,book_id,medicine_sent,slots],(err,results)=>{
                if(err){
                    return reject(err)
                }
                else{
                    return resolve(results)
                }

            })
        }
        else{
            var sql="insert into presciption(pre_id,book_id,medicine_sent,purchasedmedicine) values(?,?,?,?)";
            connection.query(sql,[pres_id,book_id,0,"not given"],(err,results)=>{
                if(err){
                    return reject(err)
                }
                else{
                    return resolve(results)
                }

            })
           
        }

    })
}

router.post('/presciption',async (req,res)=>{
    try{
        let  pres_id=randomnumbers(10);
        
        book_id=req.body.book_id
        medicine_sent=req.body.medicine_sent
        purchasedmedicine=req.body.purchasedmedicine


        const insert=await purchasedmed(pres_id,book_id,medicine_sent,purchasedmedicine);
        res.status(200).send(insert)


    }
    catch(error){
        console.log(error)
        res.status(400).send(error)

    }
})


fetchpresciption=()=>{
    return  new Promise((resolve,reject)=>{
        var sql="select  pre_id,book_id,medicine_sent from  presciption";
        connection.query(sql,(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
               

                var sql="select purchasedmedicine from presciption where medicine_sent=1";
                connection.query(sql,(err,resu)=>{
                   
                    let array=[]
                    let drug=[]
                    for(var i=0;i<resu.length;i++){
                       
                        //array.push({"pre_id":results[i].pre_id,"book_id":results[i].book_id,"medicine_sent":1})
                       
                        let med=resu[i].purchasedmedicine
                        let medjson=JSON.parse(med);
                       
                        for(var j=0;j<medjson.length;j++){
                            
                            var sql=`select drugname from Drug where drug_id='${medjson[j]}'`
                           
                            connection.query(sql,(err,drugres)=>{
                                
                            })
                           
                        }
                        array.push({"pre_id":results[i].pre_id,"book_id":results[i].book_id,"medicine_sent":1})
                      
                    }
                    return resolve(array)
                    
                    
                   
                })
                
            }
        })
    })
}


router.get('/presciption',async (req,res)=>{
    try{
        let fetch=await fetchpresciption();
        res.status(200).send(fetch)

    }
    catch(error){
        res.status(400).send(error)
    }
})









med=(book_id)=>{
    return new Promise((resolve,reject)=>{
        var sql="select purchasedmedicine,medicine_sent from presciption where book_id=?";

        connection.query(sql,[book_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                if(results[0].medicine_sent==1){
                let purchasedmedicine=results[0].purchasedmedicine
                let medjson=JSON.parse(purchasedmedicine)
                let array=[]
               
               
                for(var i=0;i<medjson.length;i++){
                   var sql=`select drugname from Drug where drug_id='${medjson[i]}'`
                   
                    connection.query(sql,(err,result,fields)=>{
                        if(err){
                            return reject(err)
                        }
                        else{
                            
                            array.push(result[0].drugname)
                            if(array.length==medjson.length){
                               return resolve(array)
                            }
                            
                        }
                       
                    })
                   
                }
                
            }
            else{
                return resolve('NOT GIVEN PRESCIPTIONS')
            }
        }


        })
    })
}

router.get('/presciption/:book_id',async (req,res)=>{
    try{
        const book_id=req.params.book_id


        const getmed= await med(book_id);
        res.status(200).send(getmed);

    }
    catch(err){
        res.status(400).send(err)
    }

})











medicineupdate1=(pre_id,book_id,medidcine_sent,purchasedmedicine)=>{
    return new Promise((resolve,reject)=>{
        let purchasedarray=JSON.stringify(purchasedmedicine)
            let slots=purchasedarray.replace(/['"]+/g, '')
            if(medicine_sent==1){

                 var sql='update presciption set book_id=?,medicine_sent=?,purchasedmedicine=?  where pre_id=?';
        connection.query(sql,[book_id,medidcine_sent,slots,pre_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }
        })

            }
            else{
                 var sql='update presciption set book_id=?,medicine_sent=?,purchasedmedicine=?  where pre_id=?';
        connection.query(sql,[book_id,0,'not given',pre_id],(err,results)=>{
            if(err){
                return reject(err)
            }
            else{
                return resolve(results)
            }
        })

            }

       
    })

}



router.put('/presciption/:pre_id',async (req,res)=>{
    try{
        let pre_id=req.params.pre_id
         book_id=req.body.book_id
         medicine_sent=req.body.medicine_sent
         purchasedmedicine=req.body.purchasedmedicine


         const updatemed=await medicineupdate1(pre_id,book_id,medicine_sent,purchasedmedicine);
         res.status(200).send(updatemed)


    }
    catch(error){
        res.status(400).send(error)

    }

})

module.exports=router;
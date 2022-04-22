//const express=require('express');
//const router=express.Router();
const pdf=require('pdf').pdf;
const fs=require('fs');
var doc=new pdf();
doc.text(20,20,"helooooooekkeeiceimcmcmcmcmmcd");
doc.addPage();
doc.text(20,20,"helooooooekkeeiceimcmcmcmcmmcd");
var filename="output.pdf";
fs.writeFile(filename,doc.output(),function(error){
    console.log("file is creeted")
})








//module.exports=router;
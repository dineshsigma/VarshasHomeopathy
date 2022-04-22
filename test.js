// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure

//require('dotenv').config();

/*
const jwt = require('jsonwebtoken');
const client=require('twilio')('AC8cbbfe6f789d513e2dfcfba47d36bfd0','2e76314db05257201ec5db463f08932d')

//seconr auth:425fd6a61bcb297172562cee84414cb5
client.messages.create({
  from: 'whatsapp:+14155238886',
  body: 'join applied-fall',
  statusCallback: 'http://postb.in/1234abcd',
  to: 'whatsapp:+918106838432',

  

}).then(messages=>console.log(messages.sid))




const AccessToken = require('twilio').jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

const twilioAccountSid = 'AC8cbbfe6f789d513e2dfcfba47d36bfd0';
const twilioApiKey = 'SK0ad91fee71146d6c90aa49d31d6197e0';
const twilioApiSecret = '2e76314db05257201ec5db463f08932d';
const serviceSid = 'IS69d8ec52a2644cf78fa6d0c4f2f3e7e5';
const identity = 'dineshdj432.com';

const chatGrant = new ChatGrant({
  serviceSid: serviceSid,
});

const token = new AccessToken(
  twilioAccountSid,
  twilioApiKey,
  twilioApiSecret,
  {identity: identity},
 
);

token.addGrant(chatGrant);
console.log(token.toJwt())
let retoken=token.toJwt()



/*
let axios=require('axios')
axios(
`https://accounts.google.com/o/oauth2/revoke?token=${retoken}`)
.then(async res2=>{
  console.log(res2)
  

})

//console.log("['abc','xyz']".replace(/[\[\]']+/g,''));
/*8

   let sum = 0;
   let single=0

    function value(value){

while (value) {
    sum += value % 10;
    value = Math.floor(value / 10);

    
    
   
}
while(sum){
    single+=sum % 10;
    sum=Math.floor(sum /10)
}


console.log(single)
    }
   
  
    value(55555)



    var timestamp=new Date('02/10/2016').getTime();
    console.log(timestamp)
    var todate=new Date(timestamp).getDate();
    var tomonth=new Date(timestamp).getMonth()+1;
    var toyear=new Date(timestamp).getFullYear();
    var original_date=tomonth+'/'+todate+'/'+toyear;
    console.log(original_date)
   
function date(date){
    
  
  
  

}

date('22/10/2021')




function GetTime(
    d) {

var date = new Date(d); // M-D-YYYY

var d = date.getDate();
var m = date.getMonth() + 1;
var y = date.getFullYear();
console.log(d+''+m+''+y)
   
}

console.log((GetTime('10/22/2021')));*/

//url module splits the webaddress into redableparts

//AC8cbbfe6f789d513e2dfcfba47d36bfd0

//2e76314db05257201ec5db463f08932d

//+15407099132

/*let wbm=require('wbm');
wbm.start().then(async ()=>{
    let phones=['+918106838432']
   
    const message='heleofhsdvjnd'
    await wbm.send(phones,message);
    await wbm.end();
}).catch(err=>console.log(err));
/*
const {Client}=require('whatsapp-web.js')
const client=new Client()

client.on('qr',qr=>{
    qrcode.generate(qr,{small:true})
})
client.on('ready' ,()=>{
    console.log("client is ready")
})

client.on('message',message=>{
    console.log(message.body)

})

client.initialize()*/

/*

const http = require('http');
const express = require('express');
const sessions = require('express-session');
//let sessions = require('express-session');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();

app.use(sessions({secret: 'anything-you-want-but-keep-secret'}));

app.post('/sms', (req, res) => {
   
  const smsCount = req.sessions.counter || 0;

  let message = 'Hello, thanks for the new message.';

  if(smsCount > 0) {
    message = 'Hello, thanks for message number ' + (smsCount + 1);
  }

  req.sessions.counter = smsCount + 1;

  const twiml = new MessagingResponse();
  twiml.message(message);

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});
*/

/*
var request = require('request'); //bash: npm install request
// URL for request POST /message
var token = '83763g87x';
var instanceId = '777';
var url = `https://api.chat-api.com/instance${instanceId}/message?token=${token}`;
var data = {
    phone: '8106838432', // Receivers phone
    body: 'Hello, Andrew!', // Сообщение
};
// Send a request
request({
    url: url,
    method: "POST",
    json: data
});*/

/*
function getLinkWhastapp(number, message) {
    console.log("a");
    var url =
      "https://api.whatsapp.com/send?phone=" +
      number +
      "&text=" +
      encodeURIComponent(message);
  
    //return url;
    console.log(url)
  }

  
  getLinkWhastapp('+919989342991','heloooo')*/
//

//html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body

/*
        let booked="YOUR APPOINTMENT IS BOOKED SUCCESSFULLY"
                                    docname='varsha'
                                    
                                    var mailOptions={
                                        from:process.env.EMAIL,
                                        to:email,
                                        subject:'BOOKING APPOINTMENT',
                                        template:'booked',
                                        context:{
                                            booked:booked,
                                            Id:book_id,
                                            Doctorname:docname,
                                            Time:time,
                                            BookingDate:date,
                                            userpassword:userpassword
                                           
                                        }
                                    };
                                    mailer.sendMail(
                                        mailOptions,function(error,info){
                                            if(error){
                                                return reject(error)
                                            }
                                            else{
                                               
                    
                                            }
                                        }
                                    )




//ace6efb4
//doXoWGTgLCne3zn6
                                                                                                         
var sql="select telephone from signup where user_id=?";
connection.query(sql,['1A27mYXL0px1ZNeo7GPUH6FiEc'],(err,results)=>{
 let to='whatsapp:+91'+results[0].telephone
const accountid=process.env.ACCOUNTID
const token=process.env.TOKENWHATSAPP
const client=require('twilio')(accountid,token)
client.messages.create({
   from: 'whatsapp:+14155238886',
  body: name+' '+' Appointment Booked  On'+' '+date+' '+'at'+' '+time,
  to: to
  
})

})*/

//sending otp messages
/*
let accountsid = "AC8d0c241063e6aff5e20c97d572522702";
authToken = "e724df0a51f399669499ff83f0ddcf37";

const client = require("twilio")(accountsid, authToken);

client.messages
  .create({
    body: "This is the ship that made the Kessel Run in fourteen parsecs?",
    from: "+1 267 214 6234",
    to: "+916305793367",
  })
  .then((message) => console.log(message.sid));*/
/*
var api = require("./node_modules/clicksend/api");

var smsMessage = new api.SmsMessage();

smsMessage.from = "+916305793367";
smsMessage.to = "+91" + 6305793367;
smsMessage.body = "heloooo";

let username = "dinesh.g@sigmasolutions.co.in";
api_key = "0CCED215-49F1-E356-57EA-681A4F67C923";

var smsApi = new api.SMSApi(username, api_key);

var smsCollection = new api.SmsMessageCollection();

smsCollection.messages = [smsMessage];

smsApi
  .smsSendPost(smsCollection)
  .then(function (response) {
    console.log(response.body);
  })
  .catch(function (err) {
    console.error(err.body);
  });

/*
let a = [
  {
    startDate: "2021-12-06T18:30:00.000Z",
    endDate: "2021-12-09T18:30:00.000Z",
    startAt: ["10:48 AM", "11:49 AM"],
    location: "",
    mode: true,
    date: "2021-12-07T00:00:00.000Z",
    doc_id: "1A27mYXL0px1ZNeo7GPUH6FiEc",
  },
  {
    startDate: "2021-12-06T18:30:00.000Z",
    endDate: "2021-12-09T18:30:00.000Z",
    startAt: ["10:48 AM", "11:49 AM"],
    location: "",
    mode: true,
    date: "2021-12-08T00:00:00.000Z",
    doc_id: "1A27mYXL0px1ZNeo7GPUH6FiEc",
  },
];
let result = [];
for (var j = 0; j < a.length; j++) {
  for (var i = 0; i < a[j].startAt.length; i++) {
    result.push({
      startAt: startAt[i],
      doc_id: doc_id,
      sch_id: sch_id,
      booked: 0,
      status: 0,
      bookingdate: date,
      mode: mode,
      cha_id: location,
    });
  }
}
console.log(result);
*/

//http://localhost/wordpress/index.php/ros-installation/
//http://localhost/wordpress/index.php/manuals/
//http://localhost/wordpress/index.php/create-ros-workspace/
//http://localhost/wordpress/index.php/robot-computer/
//http://localhost/wordpress/index.php/install-ros1/
//
/*
let TOKENWHATSAPP = "2e76314db05257201ec5db463f08932d";
ACCOUNTID = "AC8cbbfe6f789d513e2dfcfba47d36bfd0";

const accountid = ACCOUNTID;
const token = TOKENWHATSAPP;
const client = require("twilio")(accountid, token);
let to = "whatsapp:+91" + "9989342991";

client.messages.create({
  from: "whatsapp:+14155238886",
  body: "bd dvb dfbdf vdf  ",
  /* `NEW PAYMENT UPDATE: \n` +
    " Name: " +
    name +
    "Date Of Payement: " +
    date +
    " " +
    "at" +
    " " +
    time +
    " " +
    "Amount Paid:" +
    price,
  to: "whatsapp:+91" + "9989342991",
});
*/
/*
let Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: "rzp_live_DOy0OFFCZq2tpA",
  key_secret: "KAIeYzEMMsKRakfPWuYfebaJ",
});

var options = {
  amount: 50000, // amount in the smallest currency unit
  currency: "INR",
  receipt: "order_rcptid_11",
};
instance.orders.create(options, function (err, order) {
  console.log(order);
});
//https://youtu.be/qojkh8Vbnek
//https://37dd-223-230-7-241.ngrok.io

//https://37dd-223-230-7-241.ngrok.io/api/bookappointment/verification

//https://5458-223-230-7-241.ngrok.io
*/

let { hashSync, compareSync } = require("bcrypt");
let password = "Dinesh";

let hash = hashSync(password, 10);
console.log(hash);

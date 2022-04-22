const express = require("express");
const router = express.Router();
const { connection } = require("../db");

fetchall = () => {
  return new Promise((resolve, reject) => {
    var sql =
      "select price,medicine_course_20days,medicine_course_45days,medicine_course_90days from  price where id=1";
    connection.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      } else {
        var sql =
          "select local,international,india,medicine_course_20days,medicine_course_45days,medicine_course_90days from price where id=1";
        connection.query(sql, (err, result) => {
          let priceres = {
            Local: result[0].local,
            International: result[0].international,
            India: result[0].india,
          };
          let medicine_course = {
            medicine_course_20days: results[0].medicine_course_20days,
            medicine_course_45days: results[0].medicine_course_45days,
            medicine_course_90days: results[0].medicine_course_90days,
          };

          const response = {
            price: medicine_course,

            shipping: priceres,
          };
          return resolve(response);
        });
      }
    });
  });
};

router.get("/price", async (req, res) => {
  try {
    const fetchprice = await fetchall();
    res.status(200).send(fetchprice);
  } catch (error) {
    res.status(400).send(error);
  }
});

priceins = (
  id,

  india,
  local,
  international,
  medicine_course_20days,
  medicine_course_45days,
  medicine_course_90days
) => {
  return new Promise((resolve, reject) => {
    var sql =
      "update price set india=?,local=?,international=?,medicine_course_20days=?,medicine_course_45days=?,medicine_course_90days=? where id=1";
    connection.query(
      sql,
      [
        india,
        local,
        international,
        medicine_course_20days,
        medicine_course_45days,
        medicine_course_90days,
      ],
      (err, results) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(results);
        }
      }
    );
  });
};

router.put("/price", async (req, res) => {
  try {
    let id = 1;
    //price = req.body.price;
    india = req.body.shipping.India;
    local = req.body.shipping.Local;
    international = req.body.shipping.International;
    medicine_course_20days = req.body.price.course20;
    medicine_course_45days = req.body.price.course45;
    medicine_course_90days = req.body.price.course90;

    const insert = await priceins(
      id,

      india,
      local,
      international,
      medicine_course_20days,
      medicine_course_45days,
      medicine_course_90days
    );
    res.status(200).send(insert);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

/*
var useragent = require('express-useragent');
var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build();
function sendMessage(req)
{
    var source = req.header('user-agent');
    var ua = useragent.parse(source);
    
        //Sending message detail to any phone number using Whatsapp click to chat feature
        var encodedMessage = encodeURIComponent(req.params.message);
        driver.get(`https://web.whatsapp.com/send?phone=+${req.params.phonenum}&text=${encodedMessage}`);       
        
        //Page load wait
        driver.wait(function() {
            return driver.executeScript('return document.readyState').then(function(readyState) {
              return readyState === 'complete';
            });
          }).then(function(){
              //Time interval depends on your internet connection 2500 means 2.5 seconds
              setTimeout(function(){
                //Getting send button
                var btnSend = driver.findElement(webdriver.By.xpath('//footer/div/div[3]/button'));
                
                //Sending whatsapp message
                btnSend.click(); 
              },15000);
            
      });       
}


router.get('/:phonenum/:message', (req, res) => {
    sendMessage(req);  
    var data = {
            status: "Sending message succesfull",
            message: req.params.message,
            phonenumber: req.params.phonenum
        }      
    res.status(201).json(data);
})*/

module.exports = router;

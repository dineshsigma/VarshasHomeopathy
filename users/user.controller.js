
const { getUserByEmail } = require('./user.service');
const { jwt, sign } = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const { genSaltSync, hashSync, compareSync } = require('bcrypt');

module.exports = {




      login: (req, res, next) => {
            let body = req.body;
            let token = req.headers.authorization;

            getUserByEmail(body.email, (err, results) => {



                  if (err) {


                  }

                  if (!results) {
                        return res.status(401).send("Invalid UserName or password")


                  }

                  const hash = hashSync(body.password, 10);


                  const result = compareSync(body.password, results.password);



                  if (result) {
                        results.password = undefined;
                        const jsonwebtoken = sign({ result: results }, "qwer123", { expiresIn: '30sec' },

                              {

                              })




                        return res.status(200).send({
                              success: 1,
                              message: "login successfully",
                              token: jsonwebtoken,




                        })


                  }
                  else {
                        return res.status(401);



                  }






            });


      }




}

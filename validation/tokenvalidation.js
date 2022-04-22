const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
require('dotenv').config();
const { verify } = require('jsonwebtoken')
const { connection } = require('../db');

let checktoken = (req, res, next) => {


    const token = req.body.payload;


    if (token) {

        jwt.verify(token, process.env.TOKENREGISTER, (error, decoded) => {
            if (error) {

                res.status(404).send({ message: 'INVALID TOKEN' })
            }
            else {

                var sql = "update signup set verified=1 where email=?";
                connection.query(sql, [decoded.email], (error, results) => {
                    if (error) {
                        res.status(400).send(error)
                    }
                    else {
                        res.status(200).send({ message: "VERIFICATION SUCCESS" });
                    }
                })




            }
        })

    }
    else {
        res.status(401).send({ message: 'INVALID TOKEN' })
    }

}



module.exports = checktoken;
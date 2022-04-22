let trasnporter = require("nodemailer");
require("dotenv").config();
let hbs = require("nodemailer-express-handlebars");
let mailer = trasnporter.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

mailer.use(
  "compile",
  hbs({
    viewEngine: {
      layoutsDir: "../varshashomeopathy_backend/mail/layouts",
    },
    viewPath: "mail",
  })
);

module.exports = { mailer };

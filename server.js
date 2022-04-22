const express = require("express");
const { connection, sessionStore } = require("./db");

let cors = require("cors");
const app = express();

const bodyParser = require("body-parser");

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ type: "application/json" }));

app.use(express.json());

app.use(cors());

require("dotenv").config();

let sessions = require("express-session");
let cookie = require("cookie-parser");
app.use(
  sessions({
    sessionname: "Doctor-app",
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      Secure: true,
      samesite: true,
      path: "/",
      sameSite: "strict",
      Secure: true,
    },
   
  })
);

app.use(cookie(process.env.COOKIE_SECRET));
app.use(bodyParser.json());

connection.connect(function (err) {
  if (!err) {
    console.log("ESTABLISHED THE CONNECTION :DATABASE IS CONNECTED");
  } else {
    console.log("CONNECTION FAILED:DATABASE NOT CONNECTED");
  }
});

app.use(express.static("public/chambarimages"));
app.use(express.static("public/doctorimages"));
app.use(express.static("public/patientreports"));

/*-------------------------create sign up route---------------------------------*/

const swaggerUi = require("swagger-ui-express");

const swaggerDocuments = require("./swagger.json");
const bookingDocuments = require("./booking.json");
const aboutDocuments = require("./about.json");
const addressDocuments = require("./address.json");
const slotsDocument = require("./slotscreate.json");
const medicinesDocument = require("./drug.json");
const reviews = require("./api/reviews.json");

app.use("/swagger/docs", swaggerUi.serve, swaggerUi.setup(bookingDocuments)); //achievements
//app.use("/swagger/about", swaggerUi.serve, swaggerUi.setup(aboutDocuments)); //booking
//app.use('/swagger/reviews', swaggerUi.serve, swaggerUi.setup(reviews))
const signup = require("./api/signup");
app.use("/api/signup", signup);

const signin = require("./api/signin");
app.use("/api/signin", signin);

const logo = require("./api/logo");
app.use("/api/logo", logo);

const dose = require("./api/dosemed");
app.use("/api/dose", dose);

const otp = require("./api/otp");
app.use("/api/otp", otp);

const feedback = require("./api/feedback");
app.use("/api/feedback", feedback);

const address = require("./api/address");
app.use("/api/address", address);

const testmonials = require("./api/testmonials");
app.use("/api/testmonials", testmonials);

const blog = require("./api/blogs");
app.use("/api/blogs", blog);

const whyabout = require("./api/why");
app.use("/api/whyabout", whyabout);

const usercontact = require("./api/usercontact");
app.use("/api/usercontact", usercontact);

const patientmedicines = require("./api/patientmedicines");
app.use("/api/patientmedicines", patientmedicines);

let userdashboard = require("./api/userdashboard");
app.use("/api/userdashboard", userdashboard);

const banners = require("./api/banners");
app.use("/api/banner", banners);

const patientreviews = require("./api/patientreviews");
app.use("/api/patientreviews", patientreviews);

const achievements = require("./api/achievements");
app.use("/api/achievements", achievements);

const price = require("./api/price");
app.use("/api/price", price);

const bookappointment = require("./api/bookingappointment");
app.use("/api/bookappointment", bookappointment);

const about = require("./api/about");
app.use("/api/about", about);

const resetpassword = require("./api/resetpassword");
app.use("/api/resetpassword", resetpassword);

const reset = require("./api/resetpassword");
app.use("/#/resetpassword", reset);

const chambar = require("./api/chambar");
app.use("/api/chambar", chambar);

const department = require("./api/department");
app.use("/api/department", department);

const token = require("./users/user.router");
app.use("/api/token", token);

const doctor = require("./api/doctor");
app.use("/api/doctor", doctor);
let admin = require("./api/admin");
app.use("/api/admin", admin);
const staff = require("./api/staff");
app.use("/api/staff", staff);

const patient = require("./api/patient");
app.use("/api/patient", patient);

const presciption = require("./api/presciption");
app.use("/api/presciption", presciption);

const appointment = require("./api/appointment");
app.use("/api/appointment", appointment);
let rollbased = require("./api/rollbased");
app.use("/api/rollbased", rollbased);

let notification = require("./api/notification");
app.use("/api/notification", notification);
let location = require("./api/location");
app.use("/api/location", location);

let drug = require("./api/drug");
app.use("/api/drug", drug);

let blogs = require("./api/blogscategory");
app.use("/api/blogs", blogs);
let specialist = require("./api/specialist");
app.use("/api/specialist", specialist);
let firebase = require("./api/firebase");
app.use("/api/firebase/", firebase);
let user = require("./api/user");
app.use("/api/user", user);
// setting up SOCKET.IO
let messaging = require("./socket.io/messaging");
app.use("/api/socket.io", messaging);
const port = parseInt(process.env.PORT);

let video = require("./api/video");
app.use("/api/video", video);

let payment = require("./api/payment");
app.use("/api/payment", payment);

let razorpay = require("./api/razorpay");
app.use("/api/razorpay", razorpay);

let webhook = require("./api/bookingappointment");
app.use("/37dd-223-230-7-241.ngrok.io/api/bookappointment", webhook);

const server = app.listen(port, function (error) {
  if (error) throw console.log(error);
  console.log(`SERVER CONNECTED SUCCESSFULLY ON PORT ${port}`);
});
/*
function intervalFunc() {
  console.log('Cant stop me now!');
  const client=require('twilio')('AC8cbbfe6f789d513e2dfcfba47d36bfd0','2e76314db05257201ec5db463f08932d')

client.messages.create({
  from: 'whatsapp:+14155238886',
  body: 'join applied-fall',
  to: 'whatsapp:+919989342991',
  

}).then(messages=>console.log(messages.sid))
}

setInterval(intervalFunc, 1500);*/
// socket server
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("video-call", (user_id, room_id) => {
    socket.broadcast.emit(user_id, "joined");
  });
  app.set("socketid", socket.id);
  socket.on("disconnect", (reason) => {
    log_out = Date.now();
    var sql =
      "UPDATE socketid SET active=0 ,logouttime=?,soc_tem_reason=? WHERE soc_id=?";
    connection.query(sql, [log_out, socket.id, reason], (err, res) => {});
  });
  socket.on("CONNECT_ERROR", (reason) => {
    log_out = Date.now();
    var sql =
      "UPDATE socketid SET active=0 ,logouttime=?,soc_tem_reason=? WHERE soc_id=?";
    connection.query(sql, [log_out, socket.id, reason], (err, res) => {});
  });
});

app.set("socketio", io);

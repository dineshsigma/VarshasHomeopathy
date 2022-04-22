let express = require("express");
let bodyParser = require("body-parser");
let mysql = require("mysql");
let cors = require("cors");
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const crypto = require("crypto");

var connection = mysql.createConnection({
  host: "localhost",
  user: "dinesh",
  password: "dineshg",
  database: "doctwapp",
});
connection.connect(function (err) {
  if (!err) {
    console.log("Database is connected");
  } else {
    console.log("Error while connecting with database");
  }
});

const accountSid = "AC8cbbfe6f789d513e2dfcfba47d36bfd0";
let serid = "IS69d8ec52a2644cf78fa6d0c4f2f3e7e5";
let SID = "SK0ad91fee71146d6c90aa49d31d6197e0";
let secreat = "aRNxtEVBCvotd1rRzrT1G607c9C8PkRT";
const authToken = "2e76314db05257201ec5db463f08932d";
//create table for sign up

//var sql="create table signup(user_id int not null auto_increment,name varchar(30),email varchar(50),password varchar(50),telephone varchar(21),primary key(user_id))";
//var sql="alter table signup modify column user_id varchar(256)";
//var sql="alter table signup add column verified boolean";
//var sql="create table Chambar(cha_id int not null auto_increment,chambarimg varchar(256),departmentname varchar(50),title varchar(20),appointmentLimit int,address varchar(256),primary key(cha_id))";
// var sql="alter table Chambar add  foreign key(deptname) references Department(dept_id) on update cascade";
//var sql="create table Doctor(doc_id int not null auto_increment,doctorimg varchar(256),doctorname varchar(50),deptname varchar(20),email varchar(50),gender varchar(20),phonenumber varchar(20),primary key(doc_id))";
// var sql="create table Staff(sta_id int not null auto_increment,cha_id int,deptname int,doc_id varchar(256),name varchar(20),designation varchar(50),email varchar(100),password varchar(100),phonenumber int,date date,primary key(sta_id),foreign key(cha_id) references Chambar(cha_id),foreign key(deptname) references Department(dept_id),foreign key(doc_id) references Doctor(doc_id) on update cascade )";
//var sql="alter table Chambar add column chambarname varchar(20) after deptname"
//var sql="create table Patient(pat_id int not null auto_increment,name varchar(50),email varchar(50),phonenumber varchar(20),age int,address varchar(200),gender varchar(20),primary key(pat_id))";
//var sql="alter table Staff add column  number int";
//var sql="alter  table Patient modify column  pat_id  varchar(256)";
//var sql="alter table  Staff add column doj date after name";
//var sql="create table Patient(pat_id int not null auto_increment,user_id varchar(256),name varchar(20),email varchar(256),phonenumber int,gender varchar(20),lastvisited date,nextvisited date,status boolean,primary key(pat_id),foreign key(user_id) references signup (user_id) on update cascade ) "
/*var sql="create table Appointment(app_id int not null auto_increment,name varchar(20),user_id varchar(256),\
phonenumber int,time date,chambarname int,status boolean,primary key(app_id),\
foreign key(chambarname) references Chambar(cha_id),foreign key(user_id) references Patient(pat_id) on update cascade);"*/
//var sql="alter table Doctor add column access int";
//var sql="alter table Doctor modify column doc_id varchar(256)"
//var sql="create table Appointment(app_id int not null auto_increment,user_id varchar(256),name varchar(20),email varchar(50),time time,cha_id int,status boolean,primary key(app_id),foreign key(cha_id) references Chambar(cha_id),foreign key(user_id) references signup(user_id) on update cascade)";
//var sql="alter table Appointment add column phonenumber int after email";
//var sql="create table Schedule (id int ,  day varchar(20),daystatus boolean, start time,end time, mode boolean,primary key(id))";
//var sql="alter table Appointment modify column app_id varchar(256)";
//var sql="create table setschedule(set_id int not null auto_increment,doc_id   varchar(256) not null,data longtext,primary key(set_id),foreign key(doc_id) references Doctor(doc_id) on update cascade )"
//var sql="alter table setschedule modify column set_id varchar(256)";
//var sql="rename table setschedule  to Doctorschedule";
//var sql="create table Doctorschedule(sch_id int not null auto_increment,doc_id varchar(256),startAt time,endAt time,perPatientTime time,cha_id int,mode boolean,primary key(sch_id),foreign key(doc_id) references Doctor(doc_id),foreign key(cha_id) references  Chambar(cha_id) on update cascade)"
//var sql="alter table Appointment modify column app_id varchar(256)";
//var sql="alter table Doctorschedule add column date date after doc_id";
//var sql="alter table Appointment add column email varchar(50) after user_id"
//var sql="alter table Staff add column isActive boolean";
//var sql="alter table Chambar modify column cha_id varchar(250)";
//var sql="create table  account(id int not null auto_increment,name varchar(20),primary key(id))";
//var sql="select  startAt from Doctorschedule "
//var sql="update Doctorschedule set  startAt = date_add(startAt, %Y-%m-%d %h:%i:%s %p'')";
//var sql="select STR_TO_DATE('8:25 PM', '%l:%i %p' ) from "
//var sql="SELECT DATE_FORMAT(startAt, %Y-%m-%d %h:%i:%s %p'') from Doctorschedule"
//var sql="select STR_TO_DATE('startAt', '%l:%i %p' ) from Doctorschedule"
//var sql="select STR_TO_DATE('08:25 p.m','%1 %i %p')";
///var sql="create table booking(book_id int not null auto_increment,startAt time,endAt time,booking boolean,primary key(book_id))";
//var sql="select date_format(startAt,'%H:%i') as startAt,date_format(endAt,'%H:%i')  as endTime,date,mode from Doctorschedule;"
//var sql="alter table booking add column mode boolean";
//var sql="alter table Booking modify column book_id varchar(256)";
//var sql="CREATE TABLE blogs(name varchar(32) NOT NULL,details LONGTEXT NOT NULL,status Boolean NOT NULL,PRIMARY KEY(name));"
//var sql="select  * from Doctorschedule ORDER BY sch_id DESC LIMIT 1";//var sql="create table Booking(book_id int not null auto_increment,doc_id varchar(256),sch_id int,startAt time,endAt time,booking boolean ,mode boolean,primary key(book_id),foreign key(doc_id) references Doctor (doc_id),foreign key(sch_id) references Doctorschedule (sch_id) on update cascade)";
//var sql="alter table Booking add foreign key(user_id) references signup (user_id)";
//var sql="alter table Booking add user_id varchar(256) after sch_id"
//var sql="alter table Booking add column status boolean"
//var sql="alter table Doctorschedule drop  doc_id";
//var sql="alter table Doctorschedule add column isActive boolean";
//var sql="alter table patient modify column pat_id varchar(10)";
//var sql="alter table About add column name varchar(20)";
//var sql="create table patient(id int not null auto_increment,name varchar(20),email varchar(20),phonenumber varchar(50),primary key(id))";
//var sql="create table Booking(id int not null auto_increment,startAt time not null,endAt time not null,sch_id varchar(256) not null,cha_id int not null,doc_id varchar(256),mode boolean not null default 0,user_id varchar(256) not null default 141,booked boolean default 0,status int,primary key(id),foreign key(doc_id) references Doctor(doc_id) on update cascade)";
//var sql="alter table Booking modify column endAt varchar(32)"
//var sql="alter table Booking add column Status int not null default 0";
//var sql="create table Rollbased(roll_id int not null auto_increment,department int not null,chambar int not null,staff int not null,patient  int not null,appointment int not null ,settings int not null,doc_id varchar(256),sta_id varchar(256),threelevels boolean,primary key(roll_id),foreign key(doc_id) references Doctor (doc_id),foreign key(sta_id) references Staff (sta_id) on update cascade)";

//var sql="alter table Rollbased add column isActive boolean";
//var sql="alter table Booking modify column startAt varchar(32)";
//var sql="alter table Staff add column permission varchar(256)";
//var sql="alter table Rollbased drop column  threelevels";
//var sql="alter table Staff modify column  doj varchar(256)";
//var sql="alter table Department add  foreign key(doc_id) references Doctor(doc_id)";
//var sql="alter table Chambar add column doc_id varchar(256) after cha_id";
//var sql="alter table Chambar add foreign key(doc_id) references Doctor(doc_id)";
//var sql="alter table Patient add column doc_id varchar(256) after pat_id";

//var sql="alter table Booking add column bookingdate bigint";
//var sql="alter table Patient add foreign key(doc_id) references Doctor(doc_id)";
//var sql="alter table  Rollbased add column user_id varchar(256) not null after doc_id";
//var sql="alter table Experience add column  endAt varchar(256)";
//var sql="alter table Profileinfo modify column prof_id varchar(256)";
//var sql="ALTER TABLE blogscategory MODIFY COLUMN name varchar(32) NOT NULL;";
//var sql="create table Drug(drug_id int not null auto_increment,drugname varchar(256),description varchar(256),primary key(drug_id))";
//var sql="alter table Drug modify column drug_id varchar(50)";
//var sql="alter table blogscategory modify column DETAILS varchar(256) not null";
//var sql="alter table blogscategory add column isActive boolean";
//var sql="alter table signup add column lastsignin varchar(256)";
//var sql="alter table contact  modify column number int(40)";
//var sql="alter table signup modify column signupdate  bigint";
//var sql="alter table signup modify column lastsignin bigint";
//var sql="alter table Doctor add column signupdate bigint";
//var sql="alter table Booking add column bookingdate bigint";
//var sql="alter table Booking add foreign key(doc_id) references Doctor(doc_id) on update cascade";
//var sql="alter table booking rename Booking";
//var sql="ALTER TABLE Booking ADD COLUMN bookingdate BIGINT";
//var sql="create table review(id int not null auto_increment,doctor_id varchar(256),user_id varchar(256),rating int,description varchar(1000),isactive boolean,primary key(id),foreign key(doctor_id) references Doctor(doc_id) on update cascade)";
//var sql="alter table blogscategory add column image  varchar(256)";
//var sql="alter table  speacalist add column category varchar(256) ";
//var sql="alter table Notification add column doc_id varchar(256)";
//var sql="alter table Booking add column price int ";
//var sql="create table specalistscategory(id int not null auto_increment,name varchar(256),image varchar(256),details varchar(256),status boolean,isactive boolean,primary key(id))";
//var sql="create table speacalist(id int not null auto_increment,name varchar(50),details varchar(256),status boolean,isactive boolean,primary key(id))";
//var sql="create table blogs(id int not null auto_increment,name varchar(256),details varchar(256),status boolean,category varchar(32),image varchar(256),isactive boolean,primary key(id))"
//var sql="create table blogscategory(id int not null auto_increment,name varchar(256),status boolean,DETAILS varchar(256),isActive boolean,primary key(id))";
//var sql="create table contact(id int not null auto_increment,number int not null,email varchar(256) not null,address varchar(256) not null,timeStart varchar(32) not null,timeEnd varchar(256) not null ,primary key(id))";
//var sql="create table ServiceLocation(ser_id int not null auto_increment,Location varchar(256),primary key(ser_id))";
//var sql="create table Location(loc_id int not null auto_increment,doc_id varchar(100),location int,primary key(loc_id),foreign key(location) references ServiceLocation(ser_id))";
//var sql="create table Notification(notifi_id  int not null  auto_increment,user_id varchar(256),isActive boolean,primary key(notifi_id))"
//var sql="create table Education(id int not null auto_increment,name varchar(256) not null,description varchar(256) not null,startAt varchar(256) not null,endAt varchar(256) not null,user_id varchar(256) not null, primary key(id))";
//var sql="create table Profileinfo (prof_id int not null auto_increment,user_id varchar(256) not null,name varchar(256) not null,specialist varchar(256) not null,degree varchar(256),experienceyears varchar(20) not null,email varchar(50) not null,phone varchar(30) not null,aboutme varchar(256) not null,doctorimage varchar(256) not null,primary key(prof_id))"
//var sql="create table Experience(id int not null auto_increment,name varchar(256) not null ,user_id varchar(256) not null, primary key(id))";
//sql="alter table Doctor  add   foreign key (specialist) REFERENCES speacalist(id)  ";
//var sql="alter table Doctor  add  column specialist int";
//var sql="ALTER TABLE  Doctor DROP  column specialist";
// sql="alter table speacalist modify column id int";
//var sql="alter table Doctor add  foreign key(speclialist)"
//var sql="show create table Profileinfo";
//var sql=" alter table Doctor drop foreign key Doctor_ibfk_1;;"
//var sql="alter table Profileinfo modify column specialist int";
//var sql="alter table  Profileinfo add column specialist int";
//var sql="alter table Profileinfo add foreign key(specialist)  REFERENCES speacalist(id)"
//var sql="create table doctorspecalist(id int not null auto_increment,doc_id varchar(256) not null,specalist varchar(256) not null ,primary key(id))"
//var sql="alter table speacalist modify column id int not null auto_increment";
//var sql="alter table Profileinfo add column gender varchar(20)";
//var sql="alter table  Profileinfo drop foreign key Profileinfo_ibfk_1";
//var sql="alter table speacalist  modify id  int not null  auto_increment,primary key"
//var sql="alter table Profileinfo add column specilaist int";
//var sql="create table speacalist (id int not null auto_increment,name varchar(256),details varchar(256),status boolean,isactive boolean,image varchar(256),category int,primary key(id))"
//var sql="alter table "
//var sql="create table socketid(user_id varchar(256),soc_id varchar(256),active boolean)";
//var sql="alter table socketid add column logouttime bigint not null";
//var sql="alter table socketid add column logintime bigint not null";
//var sql="create table message(message_id int not null auto_increment,center_id varchar(256),receiver_id varchar(256),message varchar(256),messageType varchar(256),status boolean,timestamp time,readtime time,readstatus boolean ,primary key(message_id))"
//var sql="alter table message add readstatus boolean";
//var sql="alter table connection modify column  connection_id varchar(256)"//
//var sql="alter table logotable add column about varchar(500)"
//var sql="alter table message drop column center_id"
//var sql="alter table message add column connection_id varchar(256)"
//var sql="create table registration(doctor boolean,users boolean, last_edited_on bigint)"
//var sql="alter table Booking add column paymentstatus boolean"
//var sql="alter table Booking    add column reports varchar(1000)"
//var sql="alter table contact modify address varchar(1000)";
//var sql="create table BookingAppointment(book_id int not null auto_increment,name varchar(50),email  varchar(50),doctorname varchar(20),doc_id varchar(50),bookingdate date,time time,payment varchar(20),paymentstatus boolean,primary key(book_id))"
//var sql="alter table BookingAppointment modify book_id varchar(20)"
//var sql="create table About(id int not null auto_increment,image varchar(20),about varchar(1000),primary key(id))";

//var sql="alter table About add column highlights boolean";
//var sql="create table Achievements(ach_id int not null auto_increment,name varchar(500),image varchar(1000),primary key(ach_id))"
//var sql="alter table Achievements modify column ach_id varchar(20)"
//var sql="create table usercontact(id int not null auto_increment,name varchar(20),email varchar(50),phonenumber int,sendmessage varchar(1000),primary key(id))";
//var sql="create table DocProfile(doc_id int not null auto_increment,doctorname varchar(20),aboutdoctor varchar(1000),docimg varchar(500),email varchar(50),phonenumber int,primary key(doc_id))"

//var sql="alter table DocProfile modify doc_id varchar(20)"
//var sql="alter table BookingAppointment add column location varchar(100)"
//var sql="create table address(add_id int not null auto_increment,doc_id varchar(20),address varchar(100),location varchar(50),primary key(add_id),foreign key(doc_id) references BookingAppointment(book_id) on update cascade)";
//var sql="create table connection(connection_id int not null auto_increment,reciver_id varchar(256),sender_id varchar(256),primary key(connection_id))";
//var  sql="create table Doctorschedule(sch_id varchar(256) not null,doc_id varchar(256) not null,date varchar(256) not null,startAT time not null,endAt time not null,timePerPatient int not null default 15,cha_id int not null,mode boolean default false,gap int not null,primary key(sch_id))";
//var sql="alter table Doctorschedule add column location int ";
//var sql="alter table Doctorschedule modify startAt varchar(1000)";
//var sql="alter table BookingAppointment add column  mode boolean";
//var sql="alter table Booking modify startAt varchar(100)";
//var sql="alter table presciption modify pre_id varchar(20)"
//var sql="alter table payments modify pat_id varchar(20)";
//var sql="alter table  bookapp add column doctorname varchar(20)"
//var sql="alter table bookapp modify column book_id varchar(20)"
//var sql="alter table buymed modify column buy_medid varchar(20)";
//var sql="alter table buymed  modify  date timestamp";
//var sql="create table AboutDoctor(id int not null auto_increment,image varchar(200),doctorname varchar(20),description varchar(20000),links varchar(500),primary key(id))";
//var sql="create table AboutDoctor(id int not null auto_increment,aboutdoctor varchar(2000),primary key(id))";
//var sql="create table Homeopathy(id int not null auto_increment,image varchar(200),description varchar(2000),primary key(id))";
//var sql="create table Testmonials(id int not null auto_increment,doctorname varchar(20),username varchar(20),testmonial varchar(1000),rating varchar(20),primary key(id))";
//var sql="create table price(id int not null auto_increment,price int,primary key(id))"
//var sql="alter table Testmonials modify  id varchar(20)"
//var sql="alter table whyHome modify column  id varchar(20)"
//var sql="alter table bookapp modify date timestamp";
//var sql="alter table AboutDoctor add column qualificationexp int"
//var sql="alter table userfeedback modify id varchar(20)"
//var sql="alter table AboutDoctor add column qualification varchar(20);"
//var sql="alter table AboutDoctor modify id varchar(20)";
//var sql="create table Dosemed(id int not null auto_increment,Dose varchar(50),primary key(id))";
//var sql="alter table review add column patientvisible boolean";
//var sql="alter table Testmonials add column   carousel boolean";
//var sql="alter table AboutDoctor add column doc_id varchar(50)"//
//var sql="alter table Dosemed modify id varchar(20)"

//var sql="create table patientmedicines(id int not null auto_increment,pat_id varchar(20),date timestamp,doc_id varchar(20),medicines varchar(500),primary key(id))";
//var sql="alter table  price add column  international int";
//var sql="create table whatapp (id int not null auto_increment,telephone varchar(40),message varchar(100),primary key(id))";
//var sql="alter table whatapp modify column id varchar(20)";
//var sql="alter table  AboutDoctor add column phonenumber varchar(50)";
//var sql="alter table Drug modify column drug_id varchar(20)"
//var sql="alter table patientmedicines modify id varchar(20)";
//var sql="create table patientreviews(id int not null auto_increment,pat_id varchar(20),doc_id varchar(20),date timestamp,time time,reviews varchar(20),patmed_id varchar(20),reports varchar(200),showuser boolean,primary key(id),foreign key(patmed_id) references patientmedicines(id) on update cascade)";
//var sql="create table patientreviews(id int not null auto_increment,doc_id varchar(20),date timestamp,time time,reviews varchar(500),patmed_id varchar(200),reports varchar(500),showuser boolean,primary key(id))";
//var sql="alter  table patientreviews modify id varchar(20)";
//var sql="alter table patient modify pat_id varchar(20)";
//var sql="create table banners(ban_id int not null auto_increment,bannerimg varchar(200),primary key(ban_id))";
//var sql="alter table banners modify ban_id varchar(20)";
//var sql="alter table buymed add column doc_id varchar(20)"
//var sql="alter table AboutDoctor add column email varchar(50)"
//var sql="alter table Homeoblogs add column showblogs boolean";
//var sql="create table bookapp(book_id int not null auto_increment,pat_id varchar(20),name varchar(20),email varchar(50),phonenumber varchar(50),booking varchar(50),date timestamp,time time,doctorname varchar(20),primary key(book_id),foreign key(pat_id) references patient(pat_id) on update cascade)";
//var sql="create  table patient(pat_id int not null auto_increment,name varchar(20),email varchar(100),phonenumber varchar(50),password varchar(500),primary key(pat_id))";
//var sql="create table userfeedback(id int not null auto_increment,book_id varchar(20),feedback varchar(1000),date timestamp,primary key(id))"
//var sql="create table whyHome(id int not null auto_increment,image varchar(200),description varchar(1000),highlights varchar(1000),primary key(id))";
//var sql="create table Homeoblogs(id int not null auto_increment,image varchar(200),title varchar(500),description varchar(500),link varchar(200),doc_id varchar(200),primary key(id))";
//var sql="create table buymed(buy_medid int not null auto_increment,name varchar(20),phonenumber bigint,email varchar(20),pay_id varchar(50),paymentstatus boolean,price int,primary key(buy_medid))"
//var sql="create table bookapp( book_id int not null auto_increment,phonenumber bigint,name varchar(20),email varchar(50),booking varchar(50),date date,time time,primary key(book_id))"
//var sql="create table payments(pat_id int not null auto_increment,amountpaid boolean, date date,primary key(pat_id))";
//var sql="create table presciptions(pre_id int not null auto_increment,book_id varchar(20),medsent boolean ,purchasedmedicine int,primary key(pre_id),foreign key(purchasedmedicine) references Drug(drug_id))";
//var sql="create table address(add_id int not null auto_increment,doc_id varchar(20),location varchar(20),address varchar(500),primary key(add_id))";
//var sql="create table BookingAppointment(book_id int not null auto_increment,name varchar(50),email  varchar(50),doctorname varchar(20),doc_id varchar(50),bookingdate date,time time,payment varchar(20),paymentstatus boolean,location int,primary key(book_id),foreign key(location) references address(add_id) on update cascade)";
//var sql="alter table patient add column doctoradd boolean";
//var sql="alter table patientreviews add column patientComments varchar(500)"
//var sql="alter table bookapp modify doc_id varchar(100)";
//var sql="alter table bookapp add column cancel boolean";
//var sql="update bookapp set cancel=0";
//var sql="alter table buymedpatients modify id varchar(20)";
//var sql="alter table Testmonials  modify date   timestamp";
//var sql="update Testmonials set doctorname='1A27mYXL0px1ZNeo7GPUH6FiEc'"
//var sql = "alter table signup add column top varchar(20)";
//var sql = "alter table price add column medicine_course_90days int";
//var sql="create table buymedpatients(id int not null auto_increment,buy_medid varchar(50),name varchar(20),email varchar(50),phonenumber varchar(20),pay_id varchar(50),paymentstatus boolean,price int,date varchar(30),time varchar(20),doc_id varchar(30),primary key(id),foreign key(buy_medid) references buymed(buy_medid) on update cascade)"
connection.query(sql, (error, results) => {
  if (error) {
    console.log(error);
  } else {
    console.log(results);
    console.log("table is created");
  }
});

app.listen(4000, function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log("server is connected");
  }
});

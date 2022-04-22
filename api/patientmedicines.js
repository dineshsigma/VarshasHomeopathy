const express = require("express");
const router = express.Router();
let { connection } = require("../db");
let { randomnumbers } = require("../randomgenerator/randomnumber");
let multer = require("multer");
let moment = require("moment");

patientreports = () => {
  return new Promise((resolve, reject) => {
    //var sql="select * from patientmedicines";
    var sql =
      "select id,pat_id,doc_id,medicines,DATE_FORMAT(date,'%Y-%m-%d') as date from patientmedicines";
    connection.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/patientmedicines", async (req, res) => {
  try {
    let getpatient = await patientreports();
    res.status(200).send(getpatient);
  } catch (error) {
    res.status(400).send(error);
  }
});

insertpatientmedicine = (id, doc_id, medicines, date, pat_id) => {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into patientmedicines (id,doc_id,medicines,date,pat_id) values(?,?,?,?,?)";
    connection.query(
      sql,
      [id, doc_id, medicines, date, pat_id],
      (err, results) => {
        if (err) {
          return reject(err);
        } else {
          const response = {
            results: results,
            id: id,
          };
          return resolve(response);
        }
      }
    );
  });
};

router.post("/patientmedicines", async (req, res) => {
  console.log("qefkjfbbdkhsfvhsdbv");
  console.log(req.body);

  try {
    if (req.session.DOC) {
      let id = randomnumbers(10);
      doc_id = req.body.doc_id;
      medicines = req.body.medicines;
      pat_id = req.body.pat_id;

      let date_ob = new Date();
      let date1 = ("0" + date_ob.getDate()).slice(-2);

      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

      let year = date_ob.getFullYear();

      const date = year + "-" + month + "-" + date1;

      let postmed = await insertpatientmedicine(
        id,
        doc_id,
        medicines,
        date,
        pat_id
      );
      res.status(200).send(postmed);
    } else {
      res.status(400).send("NOT ALLOWED");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

updatepatientmedicines = (id, medicines, date) => {
  return new Promise((resolve, reject) => {
    var sql = "update patientmedicines set medicines=?,date=? where id=?";
    connection.query(sql, [medicines, date, id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.put("/patientmedicines/:id", async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.params.id);

    let today = new Date();
    const date = today.toISOString().split("T")[0];
  } catch (error) {
    res.status(400).send(error);
  }
});

medicinesarrayinsert = (
  id,
  doc_id,
  medicines,
  pat_id,
  date,
  time,
  reviews,
  showuser,
  patientComments,
  reports
) => {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into patientmedicines(id,pat_id,doc_id,medicines,date) values(?,?,?,?,?)";
    connection.query(
      sql,
      [id, pat_id, doc_id, medicines, date],
      (err, results) => {
        if (err) return reject(err);
        let reid = randomnumbers(10);
        var sql =
          "insert into patientreviews(id,pat_id,doc_id,date,time,reviews,showuser,patmed_id,patientComments,reports) values(?,?,?,?,?,?,?,?,?,?)";
        connection.query(
          sql,
          [
            reid,
            pat_id,
            doc_id,
            date,
            time,
            reviews,
            showuser,
            id,
            patientComments,
            reports,
          ],
          (err, results) => {
            if (err) return reject(err);
            if (err) {
              return reject(err);
            } else {
              return resolve(results);
            }
          }
        );
      }
    );
  });
};

const FOLDER = "./public/patientreports";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FOLDER);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, fileName);
  },
});

// Multer Mime Type Validation
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

router.post("/postmedicines", upload.array("report", 20), async (req, res) => {
  try {
    if (req.session.DOC) {
      if (req.body.report != "undefined") {
        let report = [];
        for (var i = 0; i < req.files.length; i++) {
          report.push(req.files[i].filename);
        }

        let id = randomnumbers(10);
        doc_id = req.session.DOC.user_id;
        medicines = req.body.medicines;
        pat_id = req.body.pat_id;
        reviews = req.body.reviews;
        showuser = req.body.showuser;
        patientComments = req.body.patientComments;

        let date_ob = new Date();
        let date1 = ("0" + date_ob.getDate()).slice(-2);

        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

        let year = date_ob.getFullYear();

        const date = year + "-" + month + "-" + date1;
        var time = new Date();

        const currenttime = time.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });

        let str = JSON.stringify(medicines);

        let medarray = str.replace(/['"]+/g, "");

        let str1 = JSON.stringify(reviews);
        let reviewarray = str1.replace(/['"]+/g, "");

        let str2 = JSON.stringify(patientComments);
        let patientCommentsarray = str2.replace(/['"]+/g, "");

        let str3 = JSON.stringify(report);
        let reports = str3.replace(/['"]+/g, "");

        var dt = moment(currenttime, ["h:mm:ss A"]).format("HH:mm:ss");

        const postmed = await medicinesarrayinsert(
          id,
          doc_id,
          medarray,
          pat_id,
          date,
          dt,
          reviewarray,
          showuser,
          patientCommentsarray,
          reports
        );
        res.status(200).send(postmed);
      } //if closed for file
      else {
        let id = randomnumbers(10);
        doc_id = req.session.DOC.user_id;
        medicines = req.body.medicines;
        pat_id = req.body.pat_id;
        reviews = req.body.reviews;
        showuser = req.body.showuser;
        patientComments = req.body.patientComments;
        let date_ob = new Date();
        let date1 = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        const date = year + "-" + month + "-" + date1;
        var time = new Date();
        const currenttime = time.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
        let str = JSON.stringify(medicines);
        let medarray = str.replace(/['"]+/g, "");
        let str1 = JSON.stringify(reviews);
        let reviewarray = str1.replace(/['"]+/g, "");
        let str2 = JSON.stringify(patientComments);
        let patientCommentsarray = str2.replace(/['"]+/g, "");
        var dt = moment(currenttime, ["h:mm:ss A"]).format("HH:mm:ss");

        const patrep = await patientreportswithoutimg(
          id,
          doc_id,
          medarray,
          pat_id,
          date,
          dt,
          reviewarray,
          showuser,
          patientCommentsarray
        );
        res.status(200).send(patrep);
      }
    } //if closed for session
    else {
      res.status(400).send("NOT ALLOWED");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

patientreportswithoutimg = (
  id,
  doc_id,
  medarray,
  pat_id,
  date,
  currenttime,
  reviewarray,
  showuser,
  patientComments
) => {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into patientmedicines(id,pat_id,doc_id,medicines,date) values(?,?,?,?,?)";
    connection.query(
      sql,
      [id, pat_id, doc_id, medarray, date],
      (err, results) => {
        if (err) return reject(err);
        let reid = randomnumbers(10);
        var sql =
          "insert into patientreviews(id,pat_id,doc_id,date,time,reviews,showuser,patmed_id,patientComments) values(?,?,?,?,?,?,?,?,?)";
        connection.query(
          sql,
          [
            reid,
            pat_id,
            doc_id,
            date,
            currenttime,
            reviewarray,
            showuser,
            id,
            patientComments,
          ],
          (err, results) => {
            if (err) return reject(err);
            if (err) {
              return reject(err);
            } else {
              return resolve(results);
            }
          }
        );
      }
    );
  });
};

patientfetchreviews1 = () => {
  return new Promise((resolve, reject) => {
    var sql =
      "select p.doc_id,p.date,p.time,p.reviews,p.showuser,m.medicines,p.reports from patientreviews p,patientmedicines m where p.patmed_id=m.id ";
    connection.query(sql, (err, results) => {
      console.log(results);
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/postmedicines", async (req, res) => {
  try {
    const getreviews = await patientfetchreviews1();
    res.status(200).send(getreviews);
  } catch (error) {
    res.status(400).send(error);
  }
});

getpatientreviewsbyid = (pat_id, doc_id) => {
  return new Promise((resolve, reject) => {
    var sql =
      "select DATE_FORMAT(date ,'%Y-%m-%d') as date ,id as reviewid from patientreviews where pat_id=? and doc_id=?";
    connection.query(sql, [pat_id, doc_id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/getpatientbyid/:id", async (req, res) => {
  try {
    if (req.session.DOC) {
      let pat_id = req.params.id;
      let doc_id = req.session.DOC.user_id;

      const getreviews = await getpatientreviewsbyid(pat_id, doc_id);
      res.status(200).send(getreviews);
    } else {
      res.status(400).send("NOT ALLOWED");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

getbyreview = (id, doc_id) => {
  return new Promise((resolve, reject) => {
    var sql =
      "select r.pat_id,DATE_FORMAT(r.date,'%Y-%m-%d') as date,r.time,r.reviews,m.medicines ,r.showuser,r.reports,r.patientComments from patientmedicines m ,patientreviews r  where r.id=? and r.doc_id=? and r.patmed_id=m.id ";
    connection.query(sql, [id, doc_id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/getreviewid/:id", async (req, res) => {
  try {
    if (req.session.DOC) {
      let id = req.params.id;
      let doc_id = req.session.DOC.user_id;

      const getreviewdetails = await getbyreview(id, doc_id);
      res.status(200).send(getreviewdetails);
    } else {
      res.status(400).send("NOT ALLOWED");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.get("/", (req, res) => {
  var sql =
    "  select r.pat_id,DATE_FORMAT(r.date,'%Y-%m-%d') as date,r.time,r.reviews,m.medicines ,r.showuser,r.reports,r.patientComments from patientmedicines m ,patientreviews r  where   r.patmed_id=m.id ";
  connection.query(sql, [], (err, results) => {
    res.status(200).send(results);
  });
});

module.exports = router;

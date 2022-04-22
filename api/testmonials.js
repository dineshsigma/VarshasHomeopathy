const express = require("express");
const router = express.Router();
const { connection } = require("../db");
const { randomnumbers } = require("../randomgenerator/randomnumber");

//------------------------fetch alll  testmonials--------------------------------------//

fetchalltest = () => {
  return new Promise((resolve, reject) => {
    var sql = "select * from  Testmonials";
    connection.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/testmonials", async (req, res) => {
  try {
    const fetchtest = await fetchalltest();
    res.status(200).send(fetchtest);
  } catch (error) {
    res.status(400).send(error);
  }
});

//------------------------------------insert Testmonials---------------------------------

testinsert = (
  id,
  doctorname,
  testmonials,
  rating,
  username,
  approved,
  carousel,
  date,
  currenttime
) => {
  return new Promise((resolve, reject) => {
    var sql = "select * from bookapp where book_id=? ";
    connection.query(sql, [user_id], (err, results) => {
      if (results.length > 0) {
        var sql =
          "insert into Testmonials(id,doctorname,username,testmonial,rating,approved,carousel,date,time,user_id) values(?,?,?,?,?,?,?,?,?,?)";
        connection.query(
          sql,
          [
            id,
            doctorname,
            user_id,
            testmonials,
            rating,
            approved,
            carousel,
            date,
            currenttime,
            0,
          ],
          (err, testresults) => {
            if (err) {
              return reject(err);
            } else {
              return resolve(testresults);
            }
          }
        );
      } else {
        return reject("no  user");
      } /*else {
        var sql =
          "insert into Testmonials(id,doctorname,username,testmonial,rating,approved,carousel,date,time,user_id) values(?,?,?,?,?,?,?,?,?,?)";
        connection.query(
          sql,
          [
            id,
            doctorname,
            username,
            testmonials,
            rating,
            approved,
            carousel,
            date,
            currenttime,
            0,
          ],
          (err, testresults) => {
            if (err) {
              return reject(err);
            } else {
              return resolve(testresults);
            }
          }
        );
      }*/
    });
  });
};

doctoraddtestmonials = (
  id,
  doctorname,
  testmonials,
  rating,
  username,
  approved,
  carousel,
  date,
  currenttime
) => {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into Testmonials(id,doctorname,username,testmonial,rating,approved,carousel,date,time) values(?,?,?,?,?,?,?,?,?)";
    connection.query(
      sql,
      [
        id,
        doctorname,
        username,
        testmonials,
        rating,
        approved,
        carousel,
        date,
        currenttime,
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

router.post("/testmonials", async (req, res) => {
  console.log(req.body);

  try {
    if (req.session.DOC) {
      let doctorname = req.session.DOC.user_id;
      id = randomnumbers(10);

      testmonials = req.body.testmonials;
      rating = req.body.rating ?? "0";
      username = req.body.username ?? "0";
      approved = req.body.approved;
      carousel = req.body.carousel;

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

      const inserttest = await doctoraddtestmonials(
        id,
        doctorname,
        testmonials,
        rating,
        username,
        approved,
        carousel,
        date,
        currenttime
      );
      res.status(200).send(inserttest);
    } else if (req.session.USER) {
      id = randomnumbers(10);
      user_id = req.session.USER.user_id;
      doctorname = "1A27mYXL0px1ZNeo7GPUH6FiEc";
      testmonials = req.body.testmonial;
      rating = req.body.rating;
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

      let usertest = await useraddtestmonials(
        id,
        doctorname,
        testmonials,
        date,
        currenttime,
        rating,
        user_id
      );
      res.status(200).send(usertest);
    } else {
      res.status(400).send("  NOT ALLOWED");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

useraddtestmonials = (
  id,
  doctorname,
  testmonials,
  date,
  time,
  rating,
  user_id
) => {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into Testmonials(id,doctorname,testmonial,date,time,rating,user_id) values(?,?,?,?,?,?,?)";
    connection.query(
      sql,
      [id, doctorname, testmonials, date, time, rating, user_id],
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

usertestmonials = (user_id) => {
  return new Promise((resolve, reject) => {
    var sql =
      "select t.testmonial,t.rating,t.time,DATE_FORMAT(date,'%Y-%m-%d') as date ,s.name as doctorname from Testmonials t,signup s where s.user_id=t.doctorname and t.user_id=?";
    connection.query(sql, [user_id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/usertestmonials", async (req, res) => {
  try {
    if (req.session.USER) {
      let user_id = req.session.USER.user_id;

      let getusertestmonials = await usertestmonials(user_id);
      res.status(200).send(getusertestmonials);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//-----------------------------------fetch by id---------------------------//

fetchbyid = (id) => {
  return new Promise((resolve, reject) => {
    var sql = "select * from Testmonials where id=?";
    connection.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/testmonials/:id", async (req, res) => {
  try {
    let id = req.params.id;

    const fetchid = await fetchbyid(id);
    res.status(200).send(fetchid);
  } catch (error) {
    return reject(error);
  }
});

//--------------------------------delete Testmonials--------------------------------------------//

deletebyid = (id) => {
  return new Promise((resolve, reject) => {
    var sql = "delete from Testmonials where id=?";
    connection.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.delete("/testmonials/:id", async (req, res) => {
  try {
    let id = req.params.id;

    const del = await deletebyid(id);
    res.status(200).send(del);
  } catch (error) {
    res.status(400).send(error);
  }
});

//-----------------------------update Testmonials-----------------------------------------//

Testupdate = (id, doctorname, username, testmonials, rating) => {
  return new Promise((resolve, reject) => {
    var sql =
      "update Testmonials set doctorname=?,username=?,testmonial=?,rating=? where id=?";
    connection.query(
      sql,
      [doctorname, username, testmonials, rating, id],
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

router.put("/testmonials/:id", async (req, res) => {
  try {
    let id = req.params.id;
    doctorname = req.body.doctorname;
    username = req.body.username;
    testmonials = req.body.testmonials;
    rating = req.body.rating ?? "0";

    const updatetest = await Testupdate(
      id,
      doctorname,
      username,
      testmonials,
      rating
    );
    res.status(200).send(updatetest);
  } catch (error) {
    res.status(400).send(error);
  }
});

tetsmonialsbydoctor = (doctorname) => {
  return new Promise((resolve, reject) => {
    var sql = "select * from Testmonials where doctorname=?";
    connection.query(sql, [doctorname], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/doctortestmonials", async (req, res) => {
  if (req.session.DOC) {
    let doctorname = req.session.DOC.user_id;

    const getdoctortest = await tetsmonialsbydoctor(doctorname);
    res.status(200).send(getdoctortest);
  } else {
    res.status(400).send("NOT ALLOWED");
  }
});

approvedUpdate = (id, approved) => {
  return new Promise((resolve, reject) => {
    if (approved == 0) {
      var sql = "update Testmonials set approved=?,carousel=? where id=?";
      connection.query(sql, [approved, 0, id], (err, results) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(results);
        }
      });
    } else {
      var sql = "update Testmonials set approved=? where id=?";
      connection.query(sql, [approved, id], (err, results) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(results);
        }
      });
    }
  });
};
router.post("/approve", async (req, res) => {
  console.log(req.body);
  try {
    let id = req.body.id;
    approved = req.body.approved;

    let updateapproved = await approvedUpdate(id, approved);
    res.status(200).send(updateapproved);
  } catch (error) {
    res.status(400).send(error);
  }
});

cauroselUpdate = (id, carousel) => {
  return new Promise((resolve, reject) => {
    var sql = "update Testmonials set carousel=? where id=?";
    connection.query(sql, [carousel, id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};
router.post("/carousel", async (req, res) => {
  try {
    let id = req.body.id;
    carousel = req.body.carousel;

    let updatecarousel = await cauroselUpdate(id, carousel);
    res.status(200).send(updatecarousel);
  } catch (error) {
    res.status(400).send(error);
  }
});

getonlycarousel = () => {
  return new Promise((resolve, reject) => {
    var sql = "select * from Testmonials where carousel=?";
    connection.query(sql, [1], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/getcarousel", async (req, res) => {
  try {
    let carousel = await getonlycarousel();
    res.status(200).send(carousel);
  } catch (error) {
    res.status(400).send(error);
  }
});

getonlyapproved = () => {
  return new Promise((resolve, reject) => {
    var sql = "select * from Testmonials where approved=?";
    connection.query(sql, [1], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/getapproved", async (req, res) => {
  try {
    let approved = await getonlyapproved();
    res.status(200).send(approved);
  } catch (error) {
    res.status(400).send(error);
  }
});
module.exports = router;

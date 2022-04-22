const express = require("express");
const router = express.Router();
const { connection } = require("../db");
const multer = require("multer");
const fs = require("fs");
const Joi = require("joi");
const { reject } = require("async");

fetchDoctor = () => {
  return new Promise((resolve, reject) => {
    var sql = "select * from Doctor WHERE access=2";
    connection.query(sql, (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/status/:id", async (req, res) => {
  doc_id = req.params.id;
  var sql = "select * from Doctor where doc_id = ?";
  connection.query(sql, doc_id, (error, results) => {
    if (results.length > 0) {
      res.status(200).send({ message: results });
    } else {
      let sql =
        "SELECT sta_id,cha_id,deptname,doc_id,name,isActive FROM Staff WHERE sta_id=? AND isActive=1";
      let results = connection.query(sql, [doc_id], (err, results2) => {
        if (err) {
          res.status(500).send({
            message: "fetching data failed",
          });
        } else {
          res.send({ message: results2 }).status(200);
        }
      });
    }
  });
});
router.get("/fetch", async (req, res) => {
  try {
    const fetchdoc = await fetchDoctor();
    res.status(200).send(fetchdoc);
  } catch (error) {
    res.status(400).send(error);
  }
});

const FOLDER = "./public/chambarimages";

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
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

newDoctor = (
  doc_id,
  doctorimg,
  doctorname,
  email,
  gender,
  phonenumber,
  access
) => {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into Doctor(doc_id,doctorimg,doctorname,email,gender,phonenumber,access) values(?,?,?,?,?,?,?)";
    connection.query(
      sql,
      [doc_id, doctorimg, doctorname, email, gender, phonenumber, access],
      (error, results) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(results);
        }
      }
    );
  });
};

const schema = Joi.object().keys({
  doc_id: Joi.string().required(),
  doctorimg: Joi.string(),
  doctorname: Joi.string().required(),
  email: Joi.string().email().required(),
  gender: Joi.string().required(),
  phonenumber: Joi.string().min(10).required(),
  access: Joi.number(),
});

router.post("/insert", upload.single("doctorimg"), async (req, res) => {
  let { error } = schema.validate(req.body);
  if (error) {
    res.status(400).send(error);
  } else {
    try {
      const doc_id = req.body.doc_id,
        doctorimg = req.file.filename,
        doctorname = req.body.doctorname,
        email = req.body.email,
        gender = req.body.gender,
        phonenumber = req.body.phonenumber;
      access = req.body.access || 0;

      const insdoctor = await newDoctor(
        doc_id,
        doctorimg,
        doctorname,
        email,
        gender,
        phonenumber,
        access
      );
      res.status(200).send(insdoctor);
    } catch (error) {
      res.status(400).send(error);
    }
  }
});

delDoctor = (doc_id) => {
  return new Promise((resolve, reject) => {
    var sql = "select doctorimg  from Doctor where doc_id=?";
    connection.query(
      sql,
      [doc_id],

      (error, results) => {
        if (error) {
          return reject(error);
        } else {
          fs.unlink(
            "./public/chambarimages/" + results[0].doctorimg,
            (error) => {
              if (error) throw error;
            }
          );
          var sql = "delete from Doctor where doc_id=?";
          connection.query(sql, [doc_id], (error, results) => {
            if (error) {
              return reject(error);
            } else {
              return resolve(results);
            }
          });
        }
      }
    );
  });
};

router.delete("/delete/:doc_id", async (req, res) => {
  try {
    const doc_id = req.params.doc_id;
    const docdel = await delDoctor(doc_id);
    res.status(200).send(docdel);
  } catch (error) {
    res.status(400).send(error);
  }
});

fetchDocById = (doc_id) => {
  return new Promise((resolve, reject) => {
    var sql = "select * from Doctor where doc_id=?";
    connection.query(sql, [doc_id], (error, results) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/fetch/:doc_id", async (req, res) => {
  try {
    const doc_id = req.params.doc_id;

    const fetdocid = await fetchDocById(doc_id);
    res.status(200).send(fetdocid);
  } catch (error) {
    res.status(400).send(error);
  }
});

updateDoctor = (
  doc_id,
  doctorimg,
  doctorname,
  deptname,
  email,
  gender,
  phonenumber
) => {
  return new Promise((resolve, reject) => {
    var sql = "select doctorimg from Doctor where doc_id=?";
    connection.query(sql, [doc_id], (error, results) => {
      if (error) {
        return reject(error);
      } else {
        fs.writeFile(
          "./public/chambarimages/" + results[0].doctorimg,
          "./public/chambarimages/" + doctorimg,
          (error) => {
            if (error) throw error;
          }
        );
        fs.unlink("./public/chambarimages/" + results[0].doctorimg, (error) => {
          if (error) throw error;
        });
        var sql =
          "update Doctor set doctorimg=?,doctorname=?,deptname=?,email=?,gender=?,phonenumber=? where doc_id=? ";
        connection.query(
          sql,
          [doctorimg, doctorname, deptname, email, gender, phonenumber, doc_id],
          (error, results) => {
            if (error) {
              return reject(error);
            } else {
              return resolve(results);
            }
          }
        );
      }
    });
  });
};

router.put("/update", upload.single("doctorimg"), async (req, res) => {
  try {
    const doc_id = req.body.doc_id,
      doctorimg = req.file.filename,
      doctorname = req.body.doctorname,
      deptname = req.body.deptname,
      email = req.body.email,
      gender = req.body.gender,
      phonenumber = req.body.phonenumber;

    const upddoc = await updateDoctor(
      doc_id,
      doctorimg,
      doctorname,
      deptname,
      email,
      gender,
      phonenumber
    );
    res.status(200).send(upddoc);
  } catch (error) {
    res.status(400).send(error);
  }
});
router.get("/stats", (req, res) => {
  try {
    res.send("hello").status(200);
  } catch (error) {}
});
let experienceGet = (doc_id) =>
  new Promise((resolve, reject) => {
    let sql = "SELECT * FROM  Experience WHERE user_id=?";
    connection.query(sql, [doc_id], (err, results) => {
      if (err) reject(err);
      if (results) resolve(results);
    });
  });
router.get("/experience/:id", async (req, res) => {
  try {
    if (req.session.DOC) {
      let user_id = req.session.DOC.user_id;
      let results = await experienceGet(user_id);
      res.send(results).status(202);
    } else if (req.session.DOCSTAFF) {
      let user_id = req.session.DOC_ID;
      let results = await experienceGet(user_id);
      res.send(results).status(202);
    } else {
      res.status(403).send({ message: "NOT ALLOWED" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
let addExperience = (name, description, start, end, user_id) =>
  new Promise((resolve, reject) => {
    let sql =
      "INSERT INTO Experience(name, description, startAt, endAt, user_id) VALUES  (?,?,?,?,?)";
    connection.query(
      sql,
      [name, description, start, end, user_id],
      (err, results) => {
        if (err) reject(err);
        if (results) resolve(results);
      }
    );
  });
router.post("/experience", async (req, res) => {
  try {
    let name = req.body.name;
    let description = req.body.description;
    let start = req.body.start;
    let end = req.body.end;
    if (req.session.DOC) {
      let user_id = req.session.DOC.user_id;
      let results = await addExperience(name, description, start, end, user_id);
      res.send(results).status(202);
    } else if (req.session.DOCSTAFF) {
      let user_id = req.session.DOCSTAFF.user_id;
      let results = await addExperience(name, description, start, end, user_id);
      res.send(results).status(202);
    } else {
      res.send({ message: "not allowed" }).status(403);
    }
  } catch (error) {
    res.send(error).status(500);
  }
});
let editExperience = (name, description, start, end, user_id, id) =>
  new Promise((resolve, reject) => {
    let sql =
      "UPDATE Experience SET name=?, description=?, startAt=?, endAt=? WHERE user_id=? AND id=?";
    connection.query(
      sql,
      [name, description, start, end, user_id, id],
      (err, res) => {
        if (err) reject(err);
        if (res) resolve(res);
      }
    );
  });
router.put("/experience", async (req, res) => {
  try {
    let id = req.body.id;
    let name = req.body.name;
    let description = req.body.description;
    let start = req.body.start;
    let end = req.body.end;
    if (req.session.DOC) {
      let user_id = req.session.DOC.user_id;
      let results = await editExperience(
        name,
        description,
        start,
        end,
        user_id,
        id
      );
      res.send(results).status(202);
    } else if (req.session.DOCSTAFF) {
      let user_id = req.session.DOCSTAFF.user_id;
      let results = await editExperience(
        name,
        description,
        start,
        end,
        user_id
      );
      res.send(results).status(202);
    } else {
      res.send({ message: "not allowed" }).status(403);
    }
  } catch (error) {
    res.send(error).status(500);
  }
});
let deleteExperience = (user_id, id) =>
  new Promise((resolve, reject) => {
    let sql = "DELETE FROM Experience WHERE user_id=? and id=?";
    connection.query(sql, [user_id, id], (err, res) => {
      if (err) reject(err);
      if (res) resolve(res);
    });
  });
router.delete("/experience/:id", async (req, res) => {
  try {
    let id = req.params.id;
    if (req.session.DOC) {
      let user_id = req.session.DOC.user_id;
      let results = await deleteExperience(user_id, id);
      res.send(results).status(200);
    } else if (req.session.DOCSTAFF) {
      let user_id = req.session.DOCSTAFF.user_id;
      let results = await deleteExperience(end, user_id);
      res.send(results).status(200);
    } else {
      res.send({ message: "not allowed" }).status(403);
    }
  } catch (error) {
    res.send(error).status(500);
  }
});
let addEducation = (name, description, start, end, user_id) =>
  new Promise((resolve, reject) => {
    let sql =
      "INSERT INTO Education(name, description, startAt, endAt, user_id) VALUES  (?,?,?,?,?)";
    connection.query(
      sql,
      [name, description, start, end, user_id],
      (err, results) => {
        if (err) reject(err);

        if (results) resolve(results);
      }
    );
  });
router.post("/education", async (req, res) => {
  try {
    let name = req.body.name;
    let description = req.body.description;
    let start = req.body.start;
    let end = req.body.end;
    if (req.session.DOC) {
      let user_id = req.session.DOC.user_id;
      let results = await addEducation(name, description, start, end, user_id);
      res.send(results).status(202);
    } else if (req.session.DOCSTAFF) {
      let user_id = req.session.DOCSTAFF.user_id;
      let results = await addEducation(name, description, start, end, user_id);
      res.send(results).status(202);
    } else {
      res.send({ message: "not allowed" }).status(403);
    }
  } catch (error) {
    res.send(error).status(500);
  }
});
let getAllEducation = (user_id) =>
  new Promise((resolve, reject) => {
    let sql = "SELECT * FROM Education WHERE user_id=?";
    connection.query(sql, user_id, (err, results) => {
      if (err) reject(err);
      if (results) resolve(results);
    });
  });
router.get("/education/:id", async (req, res) => {
  try {
    if (req.session.DOC) {
      let user_id = req.session.DOC.user_id;
      let results = await getAllEducation(user_id);
      res.send(results).status(200);
    } else if (req.session.DOCSTAFF) {
      let user_id = req.session.DOCSTAFF.user_id;
      let results = await getAllEducation(user_id);
      res.send(results).status(200);
    } else {
      res.send({ message: "NOT ALLOWED" }).status(403);
    }
  } catch (error) {
    res.send(error).status(500);
  }
});
let updateEducationById = (name, description, startAt, endAt, user_id, id) =>
  new Promise((resolve, reject) => {
    let sql =
      "UPDATE Education SET name=?,DESCRIPTION=?,startAt=?,endAt=? WHERE user_id=? AND id=?";
    connection.query(
      sql,
      [name, description, startAt, endAt, user_id, id],
      (err, results) => {
        if (err) reject(err);
        if (results) resolve(results);
      }
    );
  });
router.put("/education", async (req, res) => {
  try {
    if (req.session.DOC) {
      let id = req.body.id;
      let name = req.body.name;
      let description = req.body.description;
      let startAt = req.body.start;
      let endAt = req.body.end;
      let user_id = req.session.DOC.user_id;
      let results = await updateEducationById(
        name,
        description,
        startAt,
        endAt,
        user_id,
        id
      );
      res.send(results).status(200);
    } else if (req.session.DOCSTAFF) {
      let id = req.body.id;
      let name = req.body.name;
      let description = req.body.description;
      let startAt = req.body.start;
      let endAt = req.body.end;
      let user_id = req.session.DOC_ID;
      let results = await updateEducationById(
        name,
        description,
        startAt,
        endAt,
        user_id,
        id
      );
      res.send(results).status(200);
    } else {
      res.send({ message: "NOT ALLOWED" }).status(403);
    }
  } catch (error) {
    res.send(error).status(500);
  }
});
let deleteEducation = (id, user_id) => {
  new Promise((resolve, reject) => {
    let sql = "DELETE FROM Education WHERE ID=? AND user_id=?";
    connection.query(sql, [id, user_id], (err, results) => {
      if (err) reject(err);
      if (results) resolve(resolve);
    });
  });
};
router.delete("/education/:id", async (req, res) => {
  try {
    if (req.session.DOC) {
      let id = req.params.id;
      let user_id = req.session.DOC.user_id;
      let results = await deleteEducation(id, user_id);
      res.send(results).status(200);
    } else if (req.session.DOCSTAFF.user_id) {
      let id = req.params.id;
      let user_id = req.session.DOCSTAFF.user_id;
      let results = await deleteEducation(id, user_id);
      res.send(results).status(200);
    } else {
      res.status(403).send({ message: "NOT ALLOWED" });
    }
  } catch (error) {
    res.send(error).status(500);
  }
});
let DOCOTRIMAGE = `./public/doctorimages`;
let doctorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DOCOTRIMAGE);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
let doctorimage = multer({ storage: doctorStorage });

/*
let updatePersonal = (prof_id,user_id, name, specialist, degree, experienceyears, email, phone, aboutme, doctorimage) => {
  new Promise((resolve, reject) => {
    data = [name, specialist, degree, experienceyears, email, phone, aboutme, doctorimage, user_id,prof_id]
    let sql = "SELECT * FROM Profileinfo where user_id=?";

    connection.query(sql, [user_id], (error, results) => {
      if (error) reject(error)
      if (results.length > 0) {
     
        let sql = "UPDATE Profileinfo SET name=?,specialist=?,degree=?,experienceyears=?,email=?,phone=?,aboutme=?,doctorimage=?,user_id=? WHERE prof_id=?"
        connection.query(sql, data, (err, res) => {
          fs.unlink(
            `${DOCOTRIMAGE}/` +
            results[0].doctorimage,
            error => {
              if (error) throw error;
            }
          );
          if (err) reject(err)
          if (res) resolve(res)
        })
      }
      else if (results.length === 0) {
        let sql = "INSERT INTO Profileinfo(prof_id,name,specialist,degree,experienceyears,email,phone,aboutme,doctorimage,user_id) VALUES (?,?,?,?,?,?,?,?,?,?)"
        connection.query(sql, data, (err, res) => {
          if (res) resolve(res)
        })

      }
    })
  })
}
*/
docprofile = (
  prof_id,
  name,
  user_id,
  doctorimage,
  specialist,
  degree,
  experienceyears,
  email,
  phone,
  aboutme,
  gender
) => {
  return new Promise((resolve, reject) => {
    var sql = "select * from Profileinfo where user_id=?";
    connection.query(sql, [user_id], (error, results) => {
      if (error) {
        return reject(error);
      }
      if (results.length > 0) {
        var sql = "select doctorimage from Profileinfo where prof_id=?";
        connection.query(sql, [prof_id], (err, results3) => {
          if (err) {
            return reject(err);
          } else {
            fs.writeFile(
              "./public/chambarimages/" + results3[0].doctorimage,
              "./public/chambarimages/" + doctorimage,
              (error) => {
                if (error) throw error;
                fs.unlink(
                  "./public/chambarimages/" + results3[0].doctorimage,
                  (error) => {
                    if (error) throw error;
                  }
                );
              }
            );
          }

          let sql =
            "update Profileinfo set name=?,specialist=?,degree=?,experienceyears=?,email=?,phone=?,aboutme=?,doctorimage=?,gender=? where user_id=?";
          connection.query(
            sql,
            [
              name,
              specialist,
              degree,
              experienceyears,
              email,
              phone,
              aboutme,
              doctorimage,
              gender,
              user_id,
            ],
            (error, results2) => {
              if (error) {
                return reject(error);
              } else {
                var sql =
                  "update Doctor set doctorimg=?,doctorname=?,email=?,gender=?,phonenumber=? where doc_id=? ";
                connection.query(
                  sql,
                  [doctorimage, name, email, gender, phone, user_id],
                  (error, results3) => {
                    if (error) {
                      return reject(error);
                    } else {
                      var sql = "update signup set email=? where user_id=?";
                      connection.query(
                        sql,
                        [email, user_id],
                        (error, results6) => {}
                      );
                    }
                  }
                );

                return resolve(results2);
              }
            }
          );
        });
      } else {
        var sql =
          "insert into Profileinfo(prof_id,user_id,name,specialist,degree,experienceyears,email,phone,aboutme,doctorimage,gender) values(?,?,?,?,?,?,?,?,?,?,?)";

        connection.query(
          sql,
          [
            prof_id,
            user_id,
            name,
            specialist,
            degree,
            experienceyears,
            email,
            phone,
            aboutme,
            doctorimage,
            gender,
          ],
          (error, results1) => {
            if (error) {
              return reject(error);
            } else {
              var sql =
                "update Doctor set doctorimg=?,doctorname=?,email=?,gender=?,phonenumber=? where doc_id=?";
              connection.query(
                sql,
                [doctorimage, name, email, gender, phone, user_id],
                (error, results2) => {
                  if (error) {
                    return reject(error);
                  } else {
                    var sql = "update signup set email=? where user_id=?";
                    connection.query(
                      sql,
                      [email, user_id],
                      (error, results3) => {}
                    );
                  }
                }
              );
              return resolve(results1);
            }
          }
        );
      }
    });
  });
};
router.put(
  "/personal/update",
  doctorimage.single("avatar"),
  async (req, res) => {
    try {
      if (req.session.DOC) {
        if (req.file == null) {
          const prof_id = req.session.DOC.user_id,
            name = req.body.name,
            user_id = req.session.DOC.user_id,
            doctorimage = req.body.avatar,
            specialist = req.body.specialist,
            degree = req.body.degree,
            experienceyears = req.body.experienceyears,
            email = req.body.email,
            gender = req.body.gender,
            phone = req.body.phone,
            aboutme = req.body.aboutme;
          let updatedocor = await docprofile(
            prof_id,
            name,
            user_id,
            doctorimage,
            specialist,
            degree,
            experienceyears,
            email,
            phone,
            aboutme,
            gender
          );
          res.status(200).send(updatedocor);
        } else {
          const prof_id = req.session.DOC.user_id,
            name = req.body.name,
            user_id = req.session.DOC.user_id,
            doctorimage = req.file.filename,
            specialist = req.body.specialist,
            degree = req.body.degree,
            experienceyears = req.body.experienceyears,
            email = req.body.email,
            phone = req.body.phone,
            gender = req.body.gender,
            aboutme = req.body.aboutme;
          let updatedocor = await docprofile(
            prof_id,
            name,
            user_id,
            doctorimage,
            specialist,
            degree,
            experienceyears,
            email,
            phone,
            aboutme,
            gender
          );
          res.status(200).send(updatedocor);
        }
      } else if (req.session.DOCSTAFF) {
        if (req.file == null) {
          const prof_id = req.session.DOCSTAFF.user_id,
            name = req.body.name,
            user_id = req.session.DOCSTAFF.user_id,
            doctorimage = req.body.avatar,
            specialist = req.body.specialist,
            degree = req.body.degree,
            experienceyears = req.body.experienceyears,
            email = req.body.email,
            phone = req.body.phone,
            gender = req.body.gender,
            aboutme = req.body.aboutme;
          let updatedocor = await docprofile(
            prof_id,
            name,
            user_id,
            doctorimage,
            specialist,
            degree,
            experienceyears,
            email,
            phone,
            aboutme,
            gender
          );
          res.status(200).send(updatedocor);
        } else {
          const prof_id = req.session.DOCSTAFF.user_id,
            name = req.body.name,
            user_id = req.session.DOCSTAFF.user_id,
            doctorimage = req.file.filename,
            specialist = req.body.specialist,
            degree = req.body.degree,
            experienceyears = req.body.experienceyears,
            email = req.body.email,
            phone = req.body.phone,
            gender = req.body.gender,
            aboutme = req.body.aboutme;
          let updatedocor = await docprofile(
            prof_id,
            name,
            user_id,
            doctorimage,
            specialist,
            degree,
            experienceyears,
            email,
            phone,
            aboutme,
            gender
          );
          res.status(200).send(updatedocor);
        }
      } else {
        res.status(200).send({ message: "NOT ALLOWED" });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

getPersonal = (user_id) =>
  new Promise((resolve, rejet) => {
    let sql = "SELECT * FROM Profileinfo WHERE user_id=?";
    connection.query(sql, user_id, (err, res) => {
      if (err) reject(error);
      if (res) resolve(res);
    });
  });
router.get("/personal", async (req, res) => {
  try {
    if (req.session.DOC) {
      let user_id = req.session.DOC.user_id;
      let results = await getPersonal(user_id);
      res.send(results).status(200);
    } else if (req.session.DOCSTAFF.user_id) {
      let user_id = req.session.DOCSTAFF.user_id;
      let results = await getPersonal(user_id);
      res.send(results).status(200);
    } else {
      res.status(403).send({ message: "NOT ALLOWED" });
    }
  } catch (error) {
    res.send(error).status(500);
  }
});

searchDoctor = (searchkey) => {
  return new Promise((resolve, reject) => {
    var sql =
      "select * from Doctor WHERE access=2 and Doctor.doctorname  LIKE ?";
    connection.query(sql, searchkey, (error, results) => {
      if (results) resolve(results);
    });
  });
};

router.get("/searchdoctor/:searchkey", async (req, res) => {
  try {
    searchkey = "%" + req.params.searchkey + "%";

    let doctorsearch = await searchDoctor(searchkey);
    res.status(200).send(doctorsearch);
  } catch (error) {
    res.status(400).send(error);
  }
});
let specalistdoctor = (specialist, doc_id) =>
  new Promise((resolve, reject) => {
    let sql = "DELETE FROM doctorspecalist WHERE doc_id=?";
    connection.query(sql, doc_id, (err, res) => {
      if (err) reject(err);
      if (res) {
        resolve({ message: "complete" });
        specialist.forEach((element) => {
          let sql = "INSERT INTO doctorspecalist(doc_id,specalist) VALUES(?,?)";
          connection.query(sql, [doc_id, element], (err, res) => {
            if (err) reject(err);
          });
        });
      }
    });
  });
router.post("/doctor/specalists", async (req, res) => {
  try {
    let doc_id = req.session.DOC_ID ?? req.session.DOC.user_id ?? "";
    if (doc_id) {
      let specialist = req.body;
      results = await specalistdoctor(specialist, doc_id);
      res.status(200).send(results);
    } else {
      res.status(401).send({ message: "not allowed" });
    }

    router.get("/filters", (req, res) => {
      var sql = "select  DISTINCT doc_id from  Doctorschedule ";
      connection.query(sql, (error, results) => {
        if (error) {
          res.status(400).send(error);
        } else {
          res.status(200).send(results);
        }
      });
    });
  } catch (error) {
    res.status(401).send({ message: "not allowed" });
  }
});
let specalistdoctorfetch = (doc_id) =>
  new Promise((resolve, reject) => {
    let sql = "SELECT * FROM doctorspecalist WHERE doc_id=?";
    connection.query(sql, doc_id, (err, res) => {
      if (err) reject(err);
      if (res) resolve(res);
    });
  });
router.get("/doctor/specalists", async (req, res) => {
  try {
    let doc_id = req.session.DOC_ID ?? req.session.DOC.user_id ?? "";

    if (doc_id) {
      let specialist = req.body;
      results = await specalistdoctorfetch(doc_id);
      res.status(200).send(results);
    } else {
      res.status(401).send({ message: "not allowed" });
    }
  } catch (error) {
    res.status(401).send({ message: "not allowed" });
  }
});
let doctorbyspecalist = (id) =>
  new Promise((resolve, reject) => {
    let sql =
      "SELECT * FROM doctorspecalist CROSS JOIN Doctor ON Doctor.doc_id=doctorspecalist.doc_id WHERE doctorspecalist.specalist=?";
    //let sql="select * from Profileinfo  p  inner join speacalist  s on  s.id=p.specialist  where s.id=?"
    connection.query(sql, id, (err, res) => {
      if (err) reject(err);

      if (res) resolve(res);
    });
  });
router.get("/specalistscat/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let results = await doctorbyspecalist(id);
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send({ message: "error during processing" });
  }
});

router.get("/seperategender", (req, res) => {
  var sql = "select * from Doctor where gender='male' and access=2";
  connection.query(sql, (error, results) => {
    if (error) {
      res.status(400).send(error);
    } else {
      var sql = "select * from Doctor where gender='female' and access=2";
      connection.query(sql, (error, results2) => {
        if (error) {
          res.status(400).send(error);
        } else {
          res
            .status(200)
            .send({ maleDoctors: results, femaleDoctors: results2 });
        }
      });
    }
  });
});
let user_appointment_user = (review, report, appo_id) =>
  new Promise((resolve, reject) => {
    var sql = "UPDATE Booking SET review=?,reports=? WHERE id=?";
    connection.query(sql, [review, report, appo_id], (err, res) => {
      if (err) reject(err);
      if (res) resolve(res);
    });
  });
let user_appointment_doctor = (item, report, appo_id, review) =>
  console.log(appo_id);

new Promise((resolve, reject) => {
  //console.log("helooo doctor")
  /* var sql = "UPDATE Booking SET items=?,reports=?,review=? WHERE id=?"
    connection.query(sql, [items, report, review,appo_id], (err, res) => {
      console.log(error)
      if (err) reject(err)
      if (res) resolve(res)
    })*/
});

const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FOLDER);
    console.log(req.file);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload1 = multer({ storage: storage1 });

router.post(
  "/user-appointment/:appo_id",
  upload1.single("reportFile"),
  async (req, res) => {
    if (req.file != null) {
      let item = [
        {
          itemId: req.body.itemId,
          itemName: req.body.itemName,
          itemPrice: req.body.itemPrice,
          itemQuantity: req.body.itemQuantity,
        },
      ];
      let report1 = [
        {
          reportId: req.body.reportId,
          reportName: req.body.reportName,
          reportDate: req.body.reportDate,
          reportFIle: req.file.filename,
        },
      ];
      let appo_id = req.params.appo_id;
      let review = req.body.review;
      console.log(review);

      const items = JSON.stringify(item);
      const report = JSON.stringify(report1);
      console.log(items);
      console.log(report);
      console.log(item);

      var sql = "UPDATE Booking SET items=?,reports=?,review=? WHERE id=?";
      connection.query(sql, [items, report, review, appo_id], (err, res) => {
        if (err) {
          console.log(err);
        } else {
          res.status(200).send(res);
        }
      });
    } else {
      console.log("report");
      res.status(400).send("PATIENT REPORT IS REQUIRED");
    }
  }
);
let review = (doc_id) =>
  new Promise((resolve, reject) => {
    var sql = "SELECT * FROM Booking WHERE doc_id=?";
    connection.query(sql, doc_id, (err, res) => {
      if (err) reject(err);
      if (res) resolve(res);
    });
  });
router.get("/review/:id", async (req, res) => {
  try {
    const doc_id = req.params.id;
    const results = await review(doc_id);
    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "error occured" });
  }
});

docprofile = (
  prof_id,
  name,
  user_id,
  doctorimages,
  speacalist,
  degree,
  experienceyears,
  email,
  gender,
  phone,
  aboutme
) => {
  return new Promise((resolve, reject) => {
    var sql =
      "insert into Profileinfo(prof_id,name,doctorimages,speacalist,degree,experienceyears,email,gender,phone,aboutme) values(?,?,?,?,?,?,?,?,?,?)";
  });
};

router.post(
  "/personal/insert",
  doctorimage.single("avatar"),
  async (req, res) => {
    try {
      if (req.session.DOC) {
        if (req.file == null) {
          const prof_id = req.session.DOC.user_id,
            name = req.body.name,
            user_id = req.session.DOC.user_id,
            doctorimage = req.body.avatar,
            specialist = req.body.specialist,
            degree = req.body.degree,
            experienceyears = req.body.experienceyears,
            email = req.body.email,
            gender = req.body.gender,
            phone = req.body.phone,
            aboutme = req.body.aboutme;
          let updatedocor = await docprofile(
            prof_id,
            name,
            user_id,
            doctorimage,
            specialist,
            degree,
            experienceyears,
            email,
            phone,
            aboutme,
            gender
          );
          res.status(200).send(updatedocor);
        } else {
          const prof_id = req.session.DOC.user_id,
            name = req.body.name,
            user_id = req.session.DOC.user_id,
            doctorimage = req.file.filename,
            specialist = req.body.specialist,
            degree = req.body.degree,
            experienceyears = req.body.experienceyears,
            email = req.body.email,
            phone = req.body.phone,
            gender = req.body.gender,
            aboutme = req.body.aboutme;
          let updatedocor = await docprofile(
            prof_id,
            name,
            user_id,
            doctorimage,
            specialist,
            degree,
            experienceyears,
            email,
            phone,
            aboutme,
            gender
          );
          res.status(200).send(updatedocor);
        }
      } else if (req.session.DOCSTAFF) {
        if (req.file == null) {
          const prof_id = req.session.DOCSTAFF.user_id,
            name = req.body.name,
            user_id = req.session.DOCSTAFF.user_id,
            doctorimage = req.body.avatar,
            specialist = req.body.specialist,
            degree = req.body.degree,
            experienceyears = req.body.experienceyears,
            email = req.body.email,
            phone = req.body.phone,
            gender = req.body.gender,
            aboutme = req.body.aboutme;
          let updatedocor = await docprofile(
            prof_id,
            name,
            user_id,
            doctorimage,
            specialist,
            degree,
            experienceyears,
            email,
            phone,
            aboutme,
            gender
          );
          res.status(200).send(updatedocor);
        } else {
          const prof_id = req.session.DOCSTAFF.user_id,
            name = req.body.name,
            user_id = req.session.DOCSTAFF.user_id,
            doctorimage = req.file.filename,
            specialist = req.body.specialist,
            degree = req.body.degree,
            experienceyears = req.body.experienceyears,
            email = req.body.email,
            phone = req.body.phone,
            gender = req.body.gender,
            aboutme = req.body.aboutme;
          let updatedocor = await docprofile(
            prof_id,
            name,
            user_id,
            doctorimage,
            specialist,
            degree,
            experienceyears,
            email,
            phone,
            aboutme,
            gender
          );
          res.status(200).send(updatedocor);
        }
      } else {
        res.status(200).send({ message: "NOT ALLOWED" });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

module.exports = router;

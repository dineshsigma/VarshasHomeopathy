const express = require("express");
const router = express.Router();
const { connection } = require("../db");
const { randomnumbers } = require("../randomgenerator/randomnumber");

let multer = require("multer");

let fs = require("fs");

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
    }
  },
});

fetchbanner = () => {
  return new Promise((resolve, reject) => {
    var sql = "select * from banners";
    connection.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/banner", async (req, res) => {
  try {
    let getbanner = await fetchbanner();
    res.status(200).send(getbanner);
  } catch (error) {
    res.status(400).send(error);
  }
});

//-----------------------insert into banners---------------------------//
insertBanner = (ban_id, bannerimg) => {
  return new Promise((resolve, reject) => {
    var sql = "insert into banners (ban_id,bannerimg) values(?,?)";
    connection.query(sql, [ban_id, bannerimg], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.post("/banner", upload.single("bannerimg"), async (req, res) => {
  try {
    if (req.file != null) {
      let ban_id = randomnumbers(10);
      bannerimg = req.file.filename;

      const postbanner = await insertBanner(ban_id, bannerimg);
      res.status(200).send(postbanner);
    } else {
      res.status(400).send("BANNER IMAGE IS REQUIRED ");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

updatebannerimg = (ban_id, bannerimg) => {
  return new Promise((resolve, reject) => {
    var sql = "select bannerimg from banners where ban_id=?";
    connection.query(sql, [ban_id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        fs.writeFile(
          "./public/chambarimages/" + results[0].bannerimg,
          "./public/chambarimages/" + bannerimg,
          (error) => {
            if (error) throw error;
          }
        );
        fs.unlink("./public/chambarimages/" + results[0].bannerimg, (error) => {
          if (error) throw error;
        });
        var sql = "update banners set bannerimg=? where ban_id=?";
        connection.query(sql, [bannerimg, ban_id], (err, results) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(results);
          }
        });
      }
    });
  });
};

router.put("/banner/:id", upload.single("bannerimg"), async (req, res) => {
  try {
    if (req.file != null) {
      let ban_id = req.params.id;
      bannerimg = req.file.filename;

      const update = await updatebannerimg(ban_id, bannerimg);
      res.status(200).send(update);
    } else {
      res.status(400).send("IMAGE .JPEG,.PNG,.JPG FORMAT ONLY");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

///---------------------------------------delete banners uimages--------------------------------------------//
bannerdelete = (ban_id) => {
  return new Promise((resolve, reject) => {
    var sql = "select bannerimg from banners where ban_id=?";
    connection.query(sql, [ban_id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        fs.unlink("./public/chambarimages/" + results[0].bannerimg, (error) => {
          if (error) throw error;
        });
        var sql = "delete from banners where ban_id=?";
        connection.query(sql, [ban_id], (err, results) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(results);
          }
        });
      }
    });
  });
};

router.delete("/banner/:id", async (req, res) => {
  try {
    let ban_id = req.params.id;

    let deleteban = await bannerdelete(ban_id);
    res.status(200).send(deleteban);
  } catch (error) {
    res.status(400).send(error);
  }
});

//--------------------------------------get banner images by id-----------------------------------------------//

getbannerbyid = (ban_id) => {
  return new Promise((resolve, reject) => {
    var sql = "select * from banners where ban_id=?";
    connection.query(sql, [ban_id], (err, results) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(results);
      }
    });
  });
};

router.get("/banner/:id", async (req, res) => {
  try {
    let ban_id = req.params.ban_id;

    const getbybanner = await getbannerbyid(ban_id);
    res.status(200).send(getbybanner);
  } catch (error) {
    res.status(400).send(error);
  }
});
module.exports = router;

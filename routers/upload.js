const express = require("express");
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix+'-'+file.originalname)
    }
  });
const upload = multer({ storage: storage });
const router = express.Router();
router.get("/", (req, res) => {
    // open the HTML file
    console.log(__dirname);
    res.sendFile("views/upload.html", {root: __dirname+"/../"});
});

router.post("/upload", upload.single('handwriting'), (req, res) => {
    if(req.file) {
        console.log(req.file);
        res.json(req.file);
    }
    else throw 'error';
});
module.exports = router;
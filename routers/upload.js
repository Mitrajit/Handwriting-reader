const express = require("express");
const multer = require('multer');

// Defining multer instance for destination and file name
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix+'-'+file.originalname)
    }
  });
// Creating the multer instance
const upload = multer({ storage: storage });
const router = express.Router();
// Main upload page
router.get("/", (req, res) => {
    // open the HTML file
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
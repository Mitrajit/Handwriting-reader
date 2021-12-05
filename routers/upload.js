const express = require("express");
const multer = require('multer');
const {OCRupload, OCRcheck} = require("../modules/OCR");
const fs = require("fs");
// Create uploads directory if it doesn't exist
fs.existsSync("./uploads") || fs.mkdirSync("./uploads");

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

router.post("/upload", upload.single('handwriting'), async (req, res) => {
    try{
    if(req.file) {
        // Call the OCR service
        const operationId = await OCRupload(__dirname+"/../"+req.file.path);
        res.status(200).json(Object.assign(req.file,{operationId: operationId}));
    }
    else throw 'File not uploaded';
  }
  catch(err){
    console.log(err);
    res.status(500).json(err);
  }
});

router.post("/ocrcheck",async (req,res)=>{
  try{
    // Check if the operation is done
    const { operationId } = req.body;
    if (fs.existsSync("./audios/" + operationId + ".wav"))
      return res.status(200).json({ status: "succeeded" });
    const output = await OCRcheck(operationId);
    if (output.status === "succeeded") {
      console.log("The texts are:");
      for (const textRecResult of output.content) {
        for (const line of textRecResult.lines) {
          console.log(line.text)
        }
      }
    }
    res.status(200).json({ status: output.status });
  }
  catch(err){
    console.log(err);
    res.status(500).json({status: 'failed', error: err});
  }
});
module.exports = router;
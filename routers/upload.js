const express = require("express");
const { OCRupload } = require("../modules/OCR");
const fs = require("fs");
const formidable = require('formidable');
const path = require("path");
// Create uploads directory if it doesn't exist
fs.existsSync("./uploads") || fs.mkdirSync("./uploads");

const router = express.Router();
// Main upload page
router.get("/", (req, res) => {
  // open the HTML file
  res.sendFile("views/upload.html", { root: __dirname + "/../" });
});

router.post("/upload", (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    const uploadFolder = path.join(__dirname, "../uploads");

    // Basic Configuration
    form.multiples = true;
    form.maxFileSize = 5 * 1024 * 1024; // 5MB
    form.uploadDir = uploadFolder;
    form.parse(req, async function (err, fields, files) {
      if (err) {
        console.log("Error parsing the files");
        return res.status(400).json({
          status: "Fail",
          message: "There was an error parsing the files",
          error: err,
        });
      }

      var oldPath = files.handwriting.filepath;
      var newPath = path.join(uploadFolder, Date.now() + '-' + Math.round(Math.random() * 1E9) + files.handwriting.originalFilename);
      var rawData = await fs.readFileSync(oldPath);
      // Delete temp file
      fs.unlinkSync(oldPath);
      fs.writeFile(newPath, rawData, async function (err) {
        if (err) console.log(err);
        const operationId = await OCRupload(newPath);
        res.status(200).json({ operationId: operationId });
      });
    });
  }
  catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.post("/ocrcheck", async (req, res) => {
  try {
    // Check if the operation is done
    const { operationId } = req.body;
    if (fs.existsSync(__dirname + "/../audios/" + operationId + "/audio.mp3"))
      return res.status(200).json({ status: "succeeded" });
    else
      return res.status(200).json({ status: "running" });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ status: 'failed', error: err });
  }
});
module.exports = router;
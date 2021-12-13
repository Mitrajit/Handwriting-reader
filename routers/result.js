const express = require("express");
const router = express.Router();
const {OCRcheck} = require("../modules/OCR");
const fs = require("fs");

router.get("/:id", (req, res) => {
  // If pathname does not end with / then redirect to /result/:id/
  req.path.endsWith("/") || res.redirect(req.path.substring(1) + "/");
  const file = __dirname + "/../audios/" + req.params.id + "/audio.mp3";
  if (fs.existsSync(file))
    res.sendFile("views/result.html", { root: __dirname + "/../" });
  else
    res.status(404).sendFile("views/404.html", { root: __dirname + "/../" });
});

router.get("/:id/text",async (req,res)=>{
    try{
      // Check if the operation is done
      const operationId = req.params.id;
      const output = await OCRcheck(operationId);
      console.log("The texts are:");
      if (output.status === "succeeded") {
        for (const textRecResult of output.content) {
          for (const line of textRecResult.lines) {
            console.log(line.text)
          }
        }
      }
      res.status(200).json(output);
    }
    catch(err){
      console.log(err);
      res.status(500).json({status: 'failed', error: err});
    }
  });

router.get("/:id/audio", (req, res)=>{
  console.log(req.params.id);
  res.sendFile("audios/"+req.params.id+"/audio.mp3",{root: __dirname+"/../"});
});

module.exports = router;
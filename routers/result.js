const express = require("express");
const router = express.Router();
const {OCRcheck} = require("../modules/OCR");
const fs = require("fs");

router.get("/:id", (req, res) => {
    // const file = __dirname+`/../audio`;
    // fs.access(file, constants.F_OK, (err) => {
    //   console.log(`${file} ${err ? 'does not exist' : 'exists'}`);
    // });

  res.sendFile("views/result.html", {root: __dirname+"/../"});
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
  res.sendFile("audios/"+req.params.id+".mp3",{root: __dirname+"/../"});
});

module.exports = router;
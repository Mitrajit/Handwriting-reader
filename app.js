require("dotenv").config();
const path = require('path');
const express = require("express");
const app = express();
const upload = require("./routers/upload");
const result = require("./routers/result");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/js', express.static(path.join(__dirname, '/views/js')));
app.use('/css', express.static(path.join(__dirname, '/views/css')));

app.use("/", upload);
app.use("/", express.static(path.join(__dirname, '/favicon_package_v0.16')));
app.use("/result", result);
app.use("/result", express.static(path.join(__dirname, '/audios')));

app.get('*', function(req, res){
    res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
  });
app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
});
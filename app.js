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
app.use('/audio', express.static(path.join(__dirname, '/audios')));

app.use("/", upload);
app.use("/result", result);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
});
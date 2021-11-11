const path = require('path');
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = require("./routers/upload");

app.use('/js', express.static(path.join(__dirname, '/views/js')));

app.use("/", upload);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
});
const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');


const {adminRouter} = require("./routes/admin.js");
const {userRouter} = require("./routes/user.js");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.get('/',function(req, res){
    res.redirect('/user/');
})

app.use('/admin',adminRouter);
app.use('/user',userRouter);

async function main() {
    await mongoose.connect(process.env.MONGODB_URL)
    app.listen(3000);
    console.log("Server started!")
}

main();
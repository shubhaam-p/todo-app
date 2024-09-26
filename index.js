const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");


const {adminRouter} = require("./routes/admin.js");
const {userRouter} = require("./routes/user.js");

const app = express();
app.use(express.json());
app.get('/',function(req, res){
    res.json('Home page');
})

app.use('/admin',adminRouter);
app.use('/user',userRouter);

async function main() {
    await mongoose.connect(process.env.MONGODB_URL)
    app.listen(3000);
    console.log("Server started!")
}

main();
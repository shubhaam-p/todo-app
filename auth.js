const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

function getPwdHashed(req, res, next){
    //validate password using zod
    const password = req.body.password;
    bcrypt.hash(password, saltRounds).then(function(hash) {
        console.log(hash, password);
        req.password = hash;
        next();
    });
}


function checkUser(req, res){
    const password = req.body.password;
    // hash should come from db
    bcrypt.compare(password, hash).then(function(result) {
        if(result)
            next();
        else
            res.json("Invalid username/ password");
    });
}

function validateJWT(req, res, next){
    if((req.headers && req.headers.token) || req.cookies.token){
        const token = req.headers.token || req.cookies.token;
        // console.log("token ",token);
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id
            next();
        } catch (e) {
            res.status(401).send(`Unauthorized ${e}}`);
        }
    }else
        res.status(500).redirect("/user/signInPage");
}

module.exports = {
    getPwdHashed,
    checkUser,
    validateJWT
}
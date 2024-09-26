const bcrypt = require("bcrypt");
const saltRounds = 10;
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

module.exports = {
    getPwdHashed,
    checkUser
}
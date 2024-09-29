const {Router} = require("express");
const {todosModel, usersModel} = require("../db");
const {getPwdHashed, checkUser} = require("../auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;
const userRouter = Router();

//encrypt the pwd & store
userRouter.post('/signup', getPwdHashed, async function(req, res){
    const username = req.body.username; 
    const password = req.password;

    try{
        const result = await usersModel.create({
            username,
            password
        }) 
        if(result){
            console.log("signup ", username, password, result._id);
            res.json("User created");
        }else
            res.json("Error!");
    }catch(error){
        res.send(error);
    }
    
})

// use jwt
//Encrypt the pwd then check if such user exists and then create JWT 
userRouter.post('/signin', async function(req, res){
    const username = req.body.username; 
    const password = req.body.password;
    console.log(username, password);
    const userExists = await usersModel.findOne({
        username:username,
    });

    if(userExists){
        bcrypt.compare(password, userExists.password).then(function(result) {
            if(result){
                const id = userExists._id.toString();
                const token = jwt.sign({id:id}, process.env.JWT_SECRET);
                res.json({token:token});
            }else
                res.json("Invalid username/ password");
        });
    }else
        res.json("User does not exist!");
})

function validateJWT(req, res, next){
    if(req.headers && req.headers.token){
        const token = req.headers.token;
        console.log("token ",token);
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("decoded ",decoded);
            req.userId = decoded.id
            next();
        } catch (e) {
            res.status(401).send('unauthorized');
        }
    }else
        res.status(500).send('unautharized');
}

//Get all todos
userRouter.get('/todo', validateJWT, async function(req, res){
    const getTodos = await todosModel.find({
        userId:req.userId
    });
    if(getTodos){
        res.json(getTodos);
    }else
        res.json("Error occured");
});

// Add a new todo
userRouter.post('/todos', validateJWT, async function(req, res){
    const title = req.body.title;
    const userId = req.userId;
    
    const add = await todosModel.create({
        title:title,
        userId:userId
    })

    if(add){
        console.log(add._id);
        res.json(`Created new todo ${add._id}`);
    }else
        res.json('Error occured');
});

// Update a todo
userRouter.put('/todos/:id', function(req, res){
    res.json('In user signin')
});

// Delete a todo
userRouter.delete('/todos/:id', function(req, res){
    res.json('In user signin')
});

module.exports = {
    userRouter: userRouter
};
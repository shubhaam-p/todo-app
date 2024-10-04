const {Router} = require("express");
const {todosModel, usersModel} = require("../db");
const {getPwdHashed, checkUser, validateJWT} = require("../auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

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
                res.cookie('token', token, { httpOnly: true });
                res.status(200).json('Logged in');
            }else
                res.json("Invalid username/ password");
        });
    }else
        res.json("User does not exist!");
})

//page after signed in
userRouter.get('/', validateJWT, function(req, res){  
    res.sendFile(path.resolve(__dirname + '/../views/index.html'));
})

//sign in form
userRouter.get('/signInPage',function(req, res){
    res.sendFile(path.resolve(__dirname + '/../views/signIn.html'));
})

//sign up form
userRouter.get('/signupPage',function(req, res){
    res.sendFile(path.resolve(__dirname + '/../views/signUp.html'));
})

//Get all todos
userRouter.get('/todo', validateJWT, async function(req, res){
    const getTodos = await todosModel.find({
        userId:req.userId,
        done:false
    });
    if(getTodos){
        res.json(getTodos);
    }else
        res.json("Error occured");
});

// Add a new todo
userRouter.post('/addtodo', validateJWT, async function(req, res){
    const title = req.body.title;
    const userId = req.userId;
    
    const add = await todosModel.create({
        title:title,
        userId:userId
    })

    if(add){
        res.json({_id:add._id, title:title});
    }else
        res.json('Error occured');  
});

// Update a todo
userRouter.put('/todos/:id', validateJWT, async function(req, res){
    console.log(req.params.id);
    const docId = req.params.id;
    const title = req.body.title;
    const done = req.body.done;

    const data = {
        title:title,
        done:done
    }
    const updateData={};
    Object.entries(data).forEach(([key, value])=>{
        if(value){
            updateData[key] = value;
        }
    })
    const update = await todosModel.updateOne({_id:docId},{$set:updateData})
    if(update)
        res.json('Updated successfully')
});

// Delete a todo
userRouter.delete('/todos/:id', validateJWT, async function(req, res){
    const docId = req.params.id;
    const update = await todosModel.deleteOne({_id:docId})
    if(update)
        res.json('Deleted successfully')
});

userRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send('Logged out successfully');
});  

module.exports = {
    userRouter: userRouter
};
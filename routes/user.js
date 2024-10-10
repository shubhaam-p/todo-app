const {Router} = require("express");
const {todosModel, usersModel} = require("../db");
const {getPwdHashed, checkUser, validateJWT} = require("../auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const process = require('node:process');
const {z} = require("zod");

const saltRounds = 10;
const userRouter = Router();

process.on('uncaughtException', function(err) {
    // Handle the error safely
    console.log("caught error ",err)
})

async function validateUserInput(req, res, next){
    const username = req.body.username; 
    const password = req.body.password;

    const userSchema = z.object({
        username: z.string({invalid_type_error: "Name must be a string",}),
        password: z.string().refine((val)=> /[A-Z]/.test(val),{message:" password must contain uppper case alphabet"})
        .refine((val)=> /[0-9]/.test(val),{message:" password must contain number"})
        .refine((val)=> /[a-z]/.test(val),{message:" password must contain lower case alphabet"})
        .refine((val)=> /[~`!@#$%^&*\(\)-=+_]/.test(val),{message:" password must contain special case character"})
    });

    const validate = userSchema.safeParse({
        username:username,
        password:password
    });
    console.log(validate);
    if(validate.success){
        next();
    }else
        res.send({"validate-msg":`${validate.error}`});
}

//encrypt the pwd & store
userRouter.post('/signup', validateUserInput, getPwdHashed, async function(req, res){
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
        isDone:false
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
    
    const result = await todosModel.create({
        title:title,
        userId:userId
    })

    if(result){
        res.json({_id:result._id, title:title, createdOn:result.createdOn});
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
        isDone:done
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

userRouter.post('/searchTodos',validateJWT, async function (req, res){
    const query = req.body.query;
    const userId = req.userId;
    const result = await todosModel.find({userId:userId, title:{$regex:`^${query}`}, isDone:false});
    if(result)
        res.json(result);
    else
        res,json("Error ocurred!")
})

userRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send('Logged out successfully');
});  

module.exports = {
    userRouter: userRouter
};
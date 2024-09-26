const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

usersSchema = new Schema({
    username: { type: String, unique: true },
    password: String
})

todosSchema = new Schema({
    title: String,
    userId: String
})

const usersModel = mongoose.model("users", usersSchema);
const todosModel = mongoose.model("todos", todosSchema);

module.exports = {
    todosModel: todosModel,
    usersModel: usersModel,
}
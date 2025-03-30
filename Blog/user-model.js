const mongoose=require('mongoose');
const { type } = require('os');
mongoose.connect("mongodb://127.0.0.1:27017/myapp")
const userSchema=new mongoose.Schema({
    name:String,
    phone:String,
    email:String,
    password:String,
    profilepic:{
        type:String,
        default: "default.webp",
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "posts"
        }
    ]
})
let users=mongoose.model("user",userSchema)
module.exports = users;
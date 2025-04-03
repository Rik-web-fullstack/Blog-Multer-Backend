const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/myapp')
const postSchema=new mongoose.Schema({
    user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"users"
    },

    date:{
        type:Date,
        default: Date.now
    },
    content :String,
    likes:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }
})
let u_post=mongoose.model("posts",postSchema)
module.exports = u_post
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const googleAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = googleAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  
const express=require('express')
const app=express()
const path=require('path')
const userModel=require("./user-model.js")
const postModel=require('./post-model.js')
const mongoose=require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/myapp")
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const bcrypt=require('bcrypt')
const upload=require('./config/multer-config.js')
const crypto=require('crypto')

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public")))

app.get("/",(req,res)=>{
    res.render("index")
})
app.post("/create",async(req,res)=>{
    let{name,phone,email,password}=req.body
    bcrypt.genSalt(10,(err,Salt)=>{
        bcrypt.hash(password,Salt,async(err,hash)=>{
            let create_user=await userModel.create({
                name,
                phone,
                email,
                password : hash
            })
            let token=jwt.sign({email},"pause")
            res.cookie("token",token)
            res.redirect("/read")
        })
    })
})
app.get("/read",async(req,res)=>{
    let read_user=await userModel.find()
    res.render("read",{read_user})
})
app.get("/delete/:id",async(req,res)=>{
    let duser=await userModel.findOneAndDelete({_id:req.params.id})
    res.redirect("/read")
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/login",async(req,res)=>{
    let checking_user=await userModel.findOne({email:req.body.email})
    if(!checking_user){
        res.status(400).send("User not exists")
    }
    bcrypt.compare(req.body.password,checking_user.password,(err,result)=>{
        if(err){
            res.status(400).send("comparison error")
        }
        if(result){
            let token=jwt.sign({email:checking_user.email},"pause")
            res.cookie("token",token)
            res.send("loggedIN")
        }
        else{
            res.status(400).send("Error occured")
        }
    })
})
app.get("/logout",async(req,res)=>{
    res.cookie("token","")
    res.redirect("/login")
})
function isLogged(req,res,next){
    if(req.cookies.token === ""){
        res.status(400).send("You need to login")
    }
    else{
        
        let data=jwt.verify(req.cookies.token,"pause")
        req.user = data
        next();
    }
}
app.get("/profile",isLogged,async(req,res)=>{
    let user=await userModel.findOne({email:req.user.email}).populate("posts");
    res.render("profile",{user})
})
app.post("/post",isLogged,async(req,res)=>{
    let user=await userModel.findOne({email:req.user.email})
    let{content}=req.body

    let post = await postModel.create({
        user : user._id,
        content,
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")
})
app.get("/profile/upload",async(req,res)=>{
    res.render("profile-upload")
})
app.post("/uploadimage",isLogged,upload.single("image"),async(req,res)=>{
    let user=await userModel.findOne({email:req.user.email})
    user.profilepic=req.file.filename;
    await user.save();
    res.redirect("/profile")
})

app.post("/generate-email",async(req,res)=>{
    const {prompt}=req.body
    const result=await model.generateContent(prompt);
    res.send(result.response.candidates[0].content.parts[0].text)
  })
  
app.listen(3000)
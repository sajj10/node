const path = require("path");
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');

const Blog = require("./models/blog");

const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = 8000;

mongoose.connect('mongodb://localhost:27017/blogify').then((e) => console.log("mongodb connected"));

app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));

app.use(express.urlencoded({extended:false})); //needed to handle url encoded data, multipart data . Use json for json format
app.use(cookieParser()); //needed to parse cookie 
app.use(checkForAuthenticationCookie("token")); 
app.use(express.static(path.resolve('./public'))); //express cannot handle static data like images by default


app.get("/", async (req, res)=>{
    // const allBlogs = await Blog.find({}).sort("createdAt",-1);
    const allBlogs = await Blog.find({})
    res.render("home",{
        user:req.user,
        blogs: allBlogs
    });
})

app.use('/user', userRoute);
app.use('/blog',blogRoute);

app.listen(PORT, ()=> console.log(`Server started at PORT: ${PORT}`));

import { Authenticate } from './Middleware/Auth'
import AuthRouter from "./Server/Login/Login" 
import profileRouter from './Server/User Info/profileEdits'
import blogRouter from './Server/Blog/blog'
import communityRouter from './Server/Community/community'
import SupervisorRouter from './Server/Supervisors/supervisor'
import NotificationRouter from './Server/User Info/Notifications'
import AdminRouter from './Server/Admin/admin'
import ChatRouter from './Server/Chat/Chat'
import AppointmentRouter from './Server/Appointments/Appointments'
import fileManager from './uploads/fileManager'
const { InitializeChat } = require('./Server/Chat/ChatIO'); // Adjust the path as needed
const { InitializeNotify }   = require("./Server/User Info/NotificationsIO")

//Main Modules
var cors = require('cors')
const express = require('express');
const app = express()
const socketIO = require("socket.io")

//un used 'yet' Modules
const path = require('path')
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
var jwt = require('jsonwebtoken');

// Chat Options
var http = require('http');
const server = http.createServer(app);
const io = socketIO(server,{cors:{origin:true}});


InitializeChat(io)
InitializeNotify(io)

// Cors Access
app.use(cors({
    origin:true,
    credentials:true
}));

//File Uplaoding
app.use(fileUpload());

// Using Json and Cookies
app.use(express.json());
app.use(cookieParser());
app.set("view engine",'ejs')

///// Middle API Servers

//Authintication
app.use("/auth",AuthRouter)

// Profile Edits
app.use("/profile",profileRouter)

// Blog
app.use("/blog",blogRouter)

// Community Posts
app.use("/community",communityRouter)

// Supervisors Functionality
app.use("/super",SupervisorRouter)

// Notification System
app.use("/notify",NotificationRouter)

// Admin Features
app.use("/admin",AdminRouter)

// Chat Features
app.use("/chat",ChatRouter)

// Appointment Features
app.use("/appointment",AppointmentRouter)

// File Management
app.use('/',fileManager)

app.use("/styles.css", express.static(path.join(__dirname, "public/styles.css")));

// Base endpoint to Test That API is Working
app.get('/',async (req,res)=>{
    res.status(200).json("Welcome to API, It's Working")
})



//--------------------------------------------------------------------------------------------------------------------------
//                                             Testing Functions Section
//--------------------------------------------------------------------------------------------------------------------------  

app.get("/checkauth",Authenticate,async (req:any,res:any)=>{
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    console.log('Request received from:', clientIP);
    console.log('User Agent:', userAgent);

    res.status(200).json("authorized")
    
})

export default server
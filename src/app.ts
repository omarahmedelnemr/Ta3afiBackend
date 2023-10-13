import { getCorsAccess } from './Middleware/cors'
import { Authenticate } from './Middleware/Auth'
import AuthRouter from "./Server/Login" 
import profileRouter from './Server/profileEdits'
//Main Modules
var cors = require('cors')
const express = require('express');
const app = express()


//un used 'yet' Modules
const path = require('path')
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
var jwt = require('jsonwebtoken');

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
export default app
import { getCorsAccess } from './Middleware/cors'
import { Authenticate } from './Middleware/Auth'
// import InitializeChat from './Server/ChatRouter'
const { InitializeChat } = require('./Server/ChatRouter'); // Adjust the path as needed

// import upload from './DB_Connections/fileUpload'

// const multer = require('multer')
const path = require('path')
var cors = require('cors')
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express()
const cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');

// For SocketIO Chat
var http = require('http');
const server = http.createServer(app);
InitializeChat(server)

app.set('Access-Control-Allow-Origin', 'http://localhost:3000');

// app.use(cors()) 
app.use(cors({
    origin:true,
    credentials:true
}));
app.use(fileUpload());

app.use(express.json());
app.use(cookieParser());
// app.use('/',chatInit)
app.set("view engine",'ejs')


// app.use(express.static(__dirname+'/views'))
// app.get('/',async (req,res)=>{
//     res.sendFile('views/index.html', {root: __dirname })
//     res.status(200).json("Wlcome to my API")
// })



//--------------------------------------------------------------------------------------------------------------------------
//                                             Testing Functions Section
//--------------------------------------------------------------------------------------------------------------------------  
app.get("/test",async (req:any,res:any)=>{
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
  
    console.log('Request received from:', clientIP);
    console.log('User Agent:', userAgent);

    res.status(200).json("Working")
})
app.get("/testAuth",getCorsAccess,Authenticate,async (req:any,res:any)=>{
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    console.log("Cookies Check 1 For This Request: ",req.cookies)
    console.log("Cookies Check 2 For This Request: ",req.headers['cookies'])
    console.log('Request received from:', clientIP);
    console.log('User Agent:', userAgent);

    res.status(200).json("Working")
})
app.get("/checkauth",Authenticate,async (req:any,res:any)=>{
    res.status(200).json("authorized")

    
})
export default server
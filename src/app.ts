import { getCorsAccess } from './Middleware/cors'
import { Authenticate } from './Middleware/Auth'
import AuthRouter from "./Server/Login" 
import profileRouter from './Server/profileEdits'
import blogRouter from './Server/blog'


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

// Blog
app.use("/blog",blogRouter)






// Base endpoint to Test That API is Working
app.get('/',async (req,res)=>{
    res.status(200).json("Welcome to API, It's Working")
})

//---------------------------------------------------------------------------------------------
//------------------------------ Files Managment Endpoints ------------------------------------
//---------------------------------------------------------------------------------------------

// Upload File Route
app.post("/upload",async (req,res)=>{
    console.log('uploading a File!')
    if (req.files ===null){
        return res.status(400).send('No files were uploaded');

    }
    const file = req.files.file ===undefined ? req.files['files[]']:req.files.file;

    try{
        if (!file) {
            return res.status(400).send('No files were uploaded');
        }
        const fileType = file.name.split('.')[file.name.split('.').length-1]
        var filePath = ''
        if (['pdf','doc','docx'].includes(fileType.toLowerCase())){
            filePath = 'uploads/pdf'
        }else if (['png','jpg','jpeg'].includes(fileType.toLowerCase())){
            filePath = 'uploads/images'
        }else{
            return res.status("400").json('File Type is Not Supported')
            
        } 

        const  d = new Date()
        const fileName = String(d.getTime())+"."+fileType
        file.mv(path.join(__dirname, filePath,fileName), (err:any) => {
            if (err) {
                return res.status(500).json({"message":"Server Error","error":err});
            }
            return res.status(200).json(fileName);
        });
    }catch(err){
        console.log(err)
        return res.status(500).json("Server Error")
    }
});

// Show Files Route
app.get("/file/:fileName",async (req,res)=>{
    const fileName = req.params.fileName;
    const fileType = fileName.split('.')[1]
    if (fileType.toLowerCase() == 'pdf'){
        const filePath = path.join(__dirname, 'uploads/pdf', fileName);
        res.sendFile(filePath);

    }else if (['png','jpg','jpeg'].includes(fileType.toLowerCase())){
        const filePath = path.join(__dirname, 'uploads/images', fileName);
        res.sendFile(filePath);
    }else{
        res.status(404).send('File Type Is Not Supported')
    }
});

// Upload a profile Picture route
app.post('/uploadProfilePic',Authenticate,getCorsAccess,async (req:any, res:any) => {

    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }
    const file = req.files.file;

    const fileType = file.name.split('.')[file.name.split('.').length-1]
    var filePath = ''
    if (['png','jpg','jpeg'].includes(fileType.toLowerCase())){
        filePath = 'uploads/profilePics'
    }else{
        return res.status("400").json('File Type is Not Supported')
        
    }
    const  d = new Date()
    const fileName = String(d.getTime())+"."+fileType
    file.mv(path.join(__dirname, filePath,fileName),async (err:any) => {
        if (err) {
            return res.status(500).send(err);
        }

        return res.status(200).json(fileName);
    });
});

// Show  profile Pics route
app.get('/profilePic/:fileName', (req:any, res:any) => {
    const fileName = req.params.fileName;
    const fileType = fileName.split('.')[1]
    if (['png','jpg','jpeg'].includes(fileType.toLowerCase())){
        const filePath = path.join(__dirname, 'uploads/profilePics', fileName);
        res.sendFile(filePath);
    }else{
        res.status(404).send('File Type Is Not Supported')
    }
});

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
// Middle Functions
import { getCorsAccess } from '../Middleware/cors' 
import { Authenticate } from '../Middleware/Auth'

//Main Modules
import { Router } from 'express'

const path = require('path')

const router = Router()


//---------------------------------------------------------------------------------------------
//------------------------------ Files Managment Endpoints ------------------------------------
//---------------------------------------------------------------------------------------------

// Upload File Route
router.post("/upload",async (req,res)=>{
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
            filePath = './pdf'
        }else if (['png','jpg','jpeg'].includes(fileType.toLowerCase())){
            filePath = './images'
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
router.get("/file/:fileName",async (req,res)=>{
    try{
        const fileName = req.params.fileName;
        const fileType = fileName.split('.')[1]
        if (fileType.toLowerCase() == 'pdf'){
            const filePath = path.join(__dirname, './pdf', fileName);
            res.sendFile(filePath);

        }else if (['png','jpg','jpeg'].includes(fileType.toLowerCase())){
            const filePath = path.join(__dirname, './images', fileName);
            res.sendFile(filePath);
        }else{
            res.status(404).send('File Type Is Not Supported')
        }
    }catch(err){
        console.log("Error!!\n",err)
        res.status(502).send("Error While DB Connection")
    }
});

// Upload a profile Picture route
router.post('/uploadProfilePic',Authenticate,getCorsAccess,async (req:any, res:any) => {

    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }
    const file = req.files.file as Router.Multer.File;

    const fileType = file.name.split('.')[file.name.split('.').length-1]
    var filePath = ''
    if (['png','jpg','jpeg'].includes(fileType.toLowerCase())){
        filePath = './profilePics'
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
router.get('/profilePic/:fileName', (req:any, res:any) => {
    const fileName = req.params.fileName;
    const fileType = fileName.split('.')[1]
    try{

        if (['png','jpg','jpeg'].includes(fileType.toLowerCase())){
            const filePath = path.join(__dirname, './profilePics', fileName);
            res.sendFile(filePath);
        }else{
            res.status(404).send('File Type Is Not Supported')
        }
    }catch(err){
        console.log("Error!\n",err)
        res.status(404).send('File Type Is Not Supported')
    }
});


export default router
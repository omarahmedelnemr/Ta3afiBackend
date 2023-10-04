// Middle Functions
import LoginFunctions from './DB_Functions/LoginFunctions'
import { getCorsAccess } from '../Middleware/cors'
import { Authenticate } from '../Middleware/Auth'

//Main Modules
import { Router } from 'express'
const router = Router()



// Base endpoint to Test That API is Working
router.post('/login',async (req,res)=>{
    const response = await  LoginFunctions.Login(req.body)
    res.status(response['status']).json(response['data'])
})

// General Signup Route for All (Doctors and Patient)
router.post("/signup",async (req,res)=>{
    const response = await LoginFunctions.Signup(req.body)
    res.status(response['status']).json(response['data'])
})

// Resend the Confirmation Code 
router.post("/resend-confirm-Code",async (req,res)=>{
    const response = await LoginFunctions.reSendConfirmCode(req.body)
    res.status(response['status']).json(response['data'])
})

//check if the Entered Confirmation Password is Correct
router.post("/check-confirmation-Code",async (req,res)=>{
    const response = await LoginFunctions.verifyCode(req.body)
    res.status(response['status']).json(response['data'])
})


router.post("/patientSignup",async (req,res)=>{
    
})
router.post("/changePassword",async (req,res)=>{
    
})
router.post("/forgetPassword",async (req,res)=>{
    
})
router.post("/changeEmail",async (req,res)=>{
    
})






export default router
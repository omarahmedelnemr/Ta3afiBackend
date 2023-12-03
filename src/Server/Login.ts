// Middle Functions
import LoginFunctions from './DB_Functions/LoginFunctions'
import { getCorsAccess } from '../Middleware/cors'
import { Authenticate } from '../Middleware/Auth'

//Main Modules
import { Router } from 'express'
const router = Router()



// Base endpoint to Test That API is Working
router.post("/login",async (req,res)=>{
    const response = await  LoginFunctions.Login(req.body)
    res.status(response['status']).json(response['data'])
})

// Signup Route For Doctors
router.post("/doctor-signup",async (req,res)=>{
    const response = await LoginFunctions.doctorSignup(req.body)
    res.status(response['status']).json(response['data'])
})

// Signup Route For Patient
router.post("/patient-signup",async (req,res)=>{
    const response = await LoginFunctions.patientSignup(req.body)
    res.status(response['status']).json(response['data'])
})

// Resend the Confirmation Code 
router.post("/send-confirmation-code",async (req,res)=>{
    const response = await LoginFunctions.SendConfirmCode(req.body)
    res.status(response['status']).json(response['data'])
})

//check if the Entered Confirmation Password is Correct
router.post("/check-confirmation-code",async (req,res)=>{
    const response = await LoginFunctions.verifyCode(req.body)
    res.status(response['status']).json(response['data'])
})

// Used To Verify Account With a Token
router.post("/verify-account",async (req,res)=>{
    const response = await LoginFunctions.confirmAccount(req.body)
    res.status(response['status']).json(response['data'])
})

// Reset The Password with Authorization Check
router.post("/reset-password",async (req,res)=>{
    const response = await LoginFunctions.forgetPassword(req.body)
    res.status(response['status']).json(response['data'])
})


export default router
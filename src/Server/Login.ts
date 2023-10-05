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
    const response = await LoginFunctions.SendConfirmCode(req.body)
    res.status(response['status']).json(response['data'])
})

//check if the Entered Confirmation Password is Correct
router.post("/check-confirmation-Code",async (req,res)=>{
    const response = await LoginFunctions.verifyCode(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding Doctors Main Info like Name, Title, Description
router.post("/doctor-main-info",async (req,res)=>{
    const response = await LoginFunctions.AddDoctorMainInfo(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding New Education Record to a Doctor
router.post("/doctor-add-education",async (req,res)=>{
    const response = await LoginFunctions.AddDoctorEducation(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding New Experince Record to a Doctor
router.post("/doctor-add-experince",async (req,res)=>{
    const response = await LoginFunctions.AddDoctorExperince(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding New Certificate Record to a Doctor
router.post("/doctor-add-certificate",async (req,res)=>{
    const response = await LoginFunctions.AddDoctorCertificate(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding Patient Main Info Like Name, BirthDate
router.post("/patient-main-info",async (req,res)=>{
    const response = await LoginFunctions.addPatientMainInfo(req.body)
    res.status(response['status']).json(response['data'])
})

// Change The Password 
router.post("/change-password",async (req,res)=>{
    const response = await LoginFunctions.changePassword(req.body)
    res.status(response['status']).json(response['data'])
})

// Send a Confirmation Code To User's Email
router.post("/forget-password",async (req,res)=>{
    const response = await LoginFunctions.SendConfirmCode(req.body)
    res.status(response['status']).json(response['data'])
})

//Check if the sent Code is Correct
router.post("/confirm-forget-password",async (req,res)=>{
    const response = await LoginFunctions.ConfirmForgetPasswordCode(req.body)
    res.status(response['status']).json(response['data'])
})

// Reset The Password with Authorization Check
router.post("/reset-password",async (req,res)=>{
    const response = await LoginFunctions.ResetPassword(req.body)
    res.status(response['status']).json(response['data'])
})


export default router
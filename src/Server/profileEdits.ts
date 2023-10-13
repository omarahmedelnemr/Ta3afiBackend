// Middle Functions
import LoginFunctions from './DB_Functions/LoginFunctions'
import profileEditFunctions from './DB_Functions/profileEditFunctions'

//Main Modules
import { Router } from 'express'
const router = Router()

//---------------------------------------------------------------------------------------------
//------------------------------------- General Endpoints -------------------------------------
//---------------------------------------------------------------------------------------------

// Send a Confirmation Code for Change The Email Used in Login Proccess for Both Doctor and Patient
router.post("/send-confirmation-code",async (req,res)=>{
    const response = await LoginFunctions.SendConfirmCode(req.body)
    res.status(response['status']).json(response['data'])
})

// Change The Email Used in Login Proccess for Both Doctor and Patient
router.post("/confirm-change-email",async (req,res)=>{
    const response = await profileEditFunctions.confirmChangeEmail(req.body)
    res.status(response['status']).json(response['data'])
})

// Change The Password for Both Doctor and Patient
router.post("/change-password",async (req,res)=>{
    const response = await profileEditFunctions.changePassword(req.body)
    res.status(response['status']).json(response['data'])
})


//---------------------------------------------------------------------------------------------
//------------------------------------- Doctor Endpoints --------------------------------------
//---------------------------------------------------------------------------------------------

// Change Doctor's Name
router.post("/doctor-name-edit",async (req,res)=>{
    const response = await profileEditFunctions.changeDoctorName(req.body)
    res.status(response['status']).json(response['data'])
})

// Change Doctor's Title
router.post("/doctor-title-edit",async (req,res)=>{
    const response = await profileEditFunctions.changeDoctorTitle(req.body)
    res.status(response['status']).json(response['data'])
})

// Change Doctor's Birth Date
router.post("/doctor-birthdate-edit",async (req,res)=>{
    const response = await profileEditFunctions.changeDoctorBirthDate(req.body)
    res.status(response['status']).json(response['data'])
})

// Change Doctor's Description
router.post("/doctor-description-edit",async (req,res)=>{
    const response = await profileEditFunctions.EditDescription(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding New Education Record to a Doctor
router.post("/doctor-education-record",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorEducation(req.body)
    res.status(response['status']).json(response['data'])
})

// Removeing Education Record for a Doctor
router.delete("/doctor-education-record",async (req,res)=>{
    const response = await profileEditFunctions.DeleteDoctorEducation(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding New Experince Record to a Doctor
router.post("/doctor-experince-record",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorExperince(req.body)
    res.status(response['status']).json(response['data'])
})

// Removeing Experince Record for a Doctor
router.delete("/doctor-experince-record",async (req,res)=>{
    const response = await profileEditFunctions.DeleteDoctorExperince(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding New Certificate Record to a Doctor
router.post("/doctor-certificate-record",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorCertificate(req.body)
    res.status(response['status']).json(response['data'])
})

// Removeing Certificate Record for a Doctor
router.delete("/doctor-certificate-record",async (req,res)=>{
    const response = await profileEditFunctions.DeleteDoctorCertificate(req.body)
    res.status(response['status']).json(response['data'])
})


//---------------------------------------------------------------------------------------------
//------------------------------------ Patient Endpoints --------------------------------------
//---------------------------------------------------------------------------------------------

// Change Doctor's Name
router.post("/patient-name",async (req,res)=>{
    const response = await profileEditFunctions.changePatientName(req.body)
    res.status(response['status']).json(response['data'])
})

// Change Patient's Name
router.post("/patient-birthdate",async (req,res)=>{
    const response = await profileEditFunctions.changePatientBirthDate(req.body)
    res.status(response['status']).json(response['data'])
})



export default router

// Middle Functions
import LoginFunctions from './DB_Functions/LoginFunctions'
import profileEditFunctions from './DB_Functions/profileEditFunctions'

//Main Modules
import { Router } from 'express'
const router = Router()

const path = require('path')

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

// Get Doctor Main Info
router.get("/doctor-main-Info",async (req,res)=>{
    const response = await profileEditFunctions.GetDoctorMainInfo(req.query)
    res.status(response['status']).json(response['data'])
})

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

// Change Doctor's Profile Image
router.post("/doctor-profile-image",async (req,res)=>{
    const response = await profileEditFunctions.changeDoctorProfileImage(req.body)
    res.status(response['status']).json(response['data'])
})

// Change Doctor's Description
router.post("/doctor-description-edit",async (req,res)=>{
    const response = await profileEditFunctions.EditDescription(req.body)
    res.status(response['status']).json(response['data'])
})

// Get All Educational Records
router.get("/doctor-education-record",async (req,res)=>{
    const response = await profileEditFunctions.GetDoctorEducationRecords(req.query)
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

// Get All Experince Records
router.get("/doctor-experince-record",async (req,res)=>{
    const response = await profileEditFunctions.GetDoctorExperinceRecords(req.query)
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

// Get All Certificate Records
router.get("/doctor-certificate-record",async (req,res)=>{
    const response = await profileEditFunctions.GetDoctorCertificateRecords(req.query)
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

// Getting all Tags for a Doctor
router.get("/doctor-tag",async (req,res)=>{
    const response = await profileEditFunctions.GetDoctorTags(req.query)
    res.status(response['status']).json(response['data'])
})

// Adding New Tag To a Doctor
router.post("/doctor-tag",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorTag(req.body)
    res.status(response['status']).json(response['data'])
})

// Removing tag for a Doctor
router.delete("/doctor-tag",async (req,res)=>{
    const response = await profileEditFunctions.DeleteDoctorTag(req.body)
    res.status(response['status']).json(response['data'])
})

// Getting all Doctor Prices Records
router.get("/doctor-price",async (req,res)=>{
    const response = await profileEditFunctions.GetDoctorPriceRanges(req.query)
    res.status(response['status']).json(response['data'])
})

// Adding New Price To a Doctor
router.post("/doctor-price",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorPriceRange(req.body)
    res.status(response['status']).json(response['data'])
})

// Removing Price for a Doctor
router.delete("/doctor-price",async (req,res)=>{
    const response = await profileEditFunctions.DeleteDoctorPriceRange(req.body)
    res.status(response['status']).json(response['data'])
})

// Getting All available Times For a Doctor
router.get("/doctor-available-time",async (req,res)=>{
    const response = await profileEditFunctions.GetDoctorAvailableTimes(req.query)
    res.status(response['status']).json(response['data'])
})

// Adding New Available Time To a Doctor
router.post("/doctor-available-time",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorAvailableTimes(req.body)
    res.status(response['status']).json(response['data'])
})

// Removing Available Time for a Doctor
router.delete("/doctor-available-time",async (req,res)=>{
    const response = await profileEditFunctions.DeleteDoctorAvailableTimes(req.body)
    res.status(response['status']).json(response['data'])
})

// Editing an Available Time for a Doctor
router.post("/doctor-available-time-edit",async (req,res)=>{
    const response = await profileEditFunctions.EditDoctorAvailableTimes(req.body)
    res.status(response['status']).json(response['data'])
})

// Getting Doctor Current Status
router.get("/doctor-status",async (req,res)=>{
    const response = await profileEditFunctions.GetStatus(req.query)
    res.status(response['status']).json(response['data'])
})

// Setting Doctor Status To Online or Offline
router.post("/doctor-status",async (req,res)=>{
    const response = await profileEditFunctions.SetStatus(req.body)
    res.status(response['status']).json(response['data'])
})

// Setting Doctor Language 
router.post("/doctor-language",async (req,res)=>{
    const response = await profileEditFunctions.ChangeDoctorLang(req.body)
    res.status(response['status']).json(response['data'])
})

// Delete Doctor's Account and It's Related Informamtion
router.delete("/doctor-account",async (req,res)=>{
    const response = await profileEditFunctions.DeleteDoctorAccount(req.body)
    res.status(response['status']).json(response['data'])
})

//---------------------------------------------------------------------------------------------
//------------------------------------ Patient Endpoints --------------------------------------
//---------------------------------------------------------------------------------------------

// Get Patient Main Info
router.get("/patient-main-Info",async (req,res)=>{
    const response = await profileEditFunctions.GetPatientMainInfo(req.query)
    res.status(response['status']).json(response['data'])
})

// Change Doctor's Name
router.post("/patient-name-edit",async (req,res)=>{
    const response = await profileEditFunctions.changePatientName(req.body)
    res.status(response['status']).json(response['data'])
})

// Change Patient's Name
router.post("/patient-birthdate-edit",async (req,res)=>{
    const response = await profileEditFunctions.changePatientBirthDate(req.body)
    res.status(response['status']).json(response['data'])
})

// Get All Patient Hobbies
router.get("/patient-hobby",async (req,res)=>{
    const response = await profileEditFunctions.GetPatientHobbies(req.query)
    res.status(response['status']).json(response['data'])
})

// Add New Patient Hobby
router.post("/patient-hobby",async (req,res)=>{
    const response = await profileEditFunctions.AddPatientHobby(req.body)
    res.status(response['status']).json(response['data'])
})

// Remove Patient Hobby
router.delete("/patient-hobby",async (req,res)=>{
    const response = await profileEditFunctions.DeletePatientHobby(req.body)
    res.status(response['status']).json(response['data'])
})

// Get All Patient Diagnoses
router.get("/patient-diagnose",async (req,res)=>{
    const response = await profileEditFunctions.GetPatientDiagnoses(req.query)
    res.status(response['status']).json(response['data'])
})

// Add New Patient Diagnose
router.post("/patient-diagnose",async (req,res)=>{
    const response = await profileEditFunctions.AddPatientDiagnose(req.body)
    res.status(response['status']).json(response['data'])
})

// Delete Patient Diagnose
router.delete("/patient-diagnose",async (req,res)=>{
    const response = await profileEditFunctions.DeletePatientDiagnose(req.body)
    res.status(response['status']).json(response['data'])
})

// Get All Patient Medicine
router.get("/patient-medicine",async (req,res)=>{
    const response = await profileEditFunctions.GetPatientMedicine(req.query)
    res.status(response['status']).json(response['data'])
})

// Add New Patient Medicine
router.post("/patient-medicine",async (req,res)=>{
    const response = await profileEditFunctions.AddPatientMedicine(req.body)
    res.status(response['status']).json(response['data'])
})

// Delete Patient Medicine
router.delete("/patient-medicine",async (req,res)=>{
    const response = await profileEditFunctions.DeletePatientMedicine(req.body)
    res.status(response['status']).json(response['data'])
})

// Get All Patient Prescription Files
router.get("/patient-prescription-file",async (req,res)=>{
    const response = await profileEditFunctions.GetPatientPrescriptionFiles(req.query)
    res.status(response['status']).json(response['data'])
})

// Add New Patient Prescription Files
router.post("/patient-prescription-file",async (req,res)=>{
    const response = await profileEditFunctions.AddPatientPrescriptionFile(req.body)
    res.status(response['status']).json(response['data'])
})

// Delete Patient Prescription Files
router.delete("/patient-prescription-file",async (req,res)=>{
    const response = await profileEditFunctions.DeletePatientPrescriptionFile(req.body)
    res.status(response['status']).json(response['data'])
})

// Setting Patient Language 
router.post("/patient-language",async (req,res)=>{
    const response = await profileEditFunctions.ChangePatientLang(req.body)
    res.status(response['status']).json(response['data'])
})


// Delete Patient Account
router.delete("/patient-account",async (req,res)=>{
    const response = await profileEditFunctions.DeletePatientAccount(req.body)
    res.status(response['status']).json(response['data'])
})





export default router

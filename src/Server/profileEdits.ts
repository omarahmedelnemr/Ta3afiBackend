// Middle Functions
import profileEditFunctions from './DB_Functions/profileEditFunctions'

//Main Modules
import { Router } from 'express'
const router = Router()

//---------------------------------------------------------------------------------------------
//------------------------------------- General Endpoints -------------------------------------
//---------------------------------------------------------------------------------------------

// Change The Password for Both Doctor and Patient
router.post("/change-password",async (req,res)=>{
    const response = await profileEditFunctions.changePassword(req.body)
    res.status(response['status']).json(response['data'])
})


//---------------------------------------------------------------------------------------------
//------------------------------------- Doctor Endpoints --------------------------------------
//---------------------------------------------------------------------------------------------

// Adding New Education Record to a Doctor
router.post("/doctor-education-record",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorEducation(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding New Experince Record to a Doctor
router.post("/doctor-experince-record",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorExperince(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding New Certificate Record to a Doctor
router.post("/doctor-certificate-record",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorCertificate(req.body)
    res.status(response['status']).json(response['data'])
})



//---------------------------------------------------------------------------------------------
//------------------------------------- Patient Endpoints --------------------------------------
//---------------------------------------------------------------------------------------------




export default router

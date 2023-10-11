// Middle Functions
import profileEditFunctions from './DB_Functions/profileEditFunctions'

//Main Modules
import { Router } from 'express'
const router = Router()




// Adding New Education Record to a Doctor
router.post("/doctor-add-education",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorEducation(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding New Experince Record to a Doctor
router.post("/doctor-add-experince",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorExperince(req.body)
    res.status(response['status']).json(response['data'])
})

// Adding New Certificate Record to a Doctor
router.post("/doctor-add-certificate",async (req,res)=>{
    const response = await profileEditFunctions.AddDoctorCertificate(req.body)
    res.status(response['status']).json(response['data'])
})

// Change The Password 
router.post("/change-password",async (req,res)=>{
    const response = await profileEditFunctions.changePassword(req.body)
    res.status(response['status']).json(response['data'])
})


export default router

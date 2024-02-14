// Middle Functions
import AppointmentFunctions from './Functions/AppointmentFunctions'
import { getCorsAccess } from '../../Middleware/cors'
import { Authenticate } from '../../Middleware/Auth'
import { DoctorAuthenticate } from '../../Middleware/DoctorAuth'
import { PatientAuthenticate } from '../../Middleware/PatientAuth'

//Main Modules
import { Router } from 'express'
const router = Router()

// ---------------------------------------------------------------------------
// ----------------------------- Patient Side ---------------------------------
// ---------------------------------------------------------------------------
// Get All Doctors List
router.get("/patient/doctors-list", getCorsAccess, PatientAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.GetAllActiveDoctors(req.query)
    res.status(response['status']).json(response['data'])
})

// Get a Selected Doctor Profile
router.get("/patient/doctor-info", getCorsAccess, PatientAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.GetDoctorProfile(req.query)
    res.status(response['status']).json(response['data'])
})

// Get a Selected Doctor Available Times
router.get("/patient/doctor-times", getCorsAccess, PatientAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.GetDoctorAvailableTimes(req.query)
    res.status(response['status']).json(response['data'])
})

// Get All Appointment List
router.get("/patient/active-appointment-list", getCorsAccess, PatientAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.getActiveAppointmentList(req.query)
    res.status(response['status']).json(response['data'])
})

// Get Appointment History List
router.get("/patient/appointment-history-list", getCorsAccess, PatientAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.getAppointmentHistoryList(req.query)
    res.status(response['status']).json(response['data'])
})

// Reserve a New Appointment
router.post("/patient/appointment", getCorsAccess, PatientAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.AddAppointment(req.body)
    res.status(response['status']).json(response['data'])
})

// Cancel an Appointment
router.delete("/patient/appointment", getCorsAccess, PatientAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.RemoveAppointment(req.body)
    res.status(response['status']).json(response['data'])
})

// Send a Public Feedback For Doctor's Appointment
router.post("/patient/doctor-review", getCorsAccess, PatientAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.postReview(req.body)
    res.status(response['status']).json(response['data'])
})

// Remove a Written Review
router.delete("/patient/doctor-review", getCorsAccess, PatientAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.removeReview(req.body)
    res.status(response['status']).json(response['data'])
})

// ---------------------------------------------------------------------------
// ----------------------------- Doctor Side ---------------------------------
// ---------------------------------------------------------------------------

// Get All Appointment List For Doctors
router.get("/doctor/active-appointment-list", getCorsAccess, DoctorAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.getActiveAppointmentListForDoctor(req.query)
    res.status(response['status']).json(response['data'])
})

// Get Appointment History List For Doctors
router.get("/doctor/appointment-history-list", getCorsAccess, DoctorAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.getAppointmentHistoryListForDoctor(req.query)
    res.status(response['status']).json(response['data'])
})

// Add New Note on an Appointment
router.post("/doctor/appointment-note", getCorsAccess, DoctorAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.AddNewNote(req.body)
    res.status(response['status']).json(response['data'])
})

// Delete a Note
router.delete("/doctor/appointment-note", getCorsAccess, DoctorAuthenticate, async (req,res)=>{
    const response = await AppointmentFunctions.RemoveNote(req.body)
    res.status(response['status']).json(response['data'])
})

export default router

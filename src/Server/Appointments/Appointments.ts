// Middle Functions
import AppointmentFunctions from './Functions/AppointmentFunctions'
import { getCorsAccess } from '../../Middleware/cors'
import { Authenticate } from '../../Middleware/Auth'

//Main Modules
import { Router } from 'express'
const router = Router()

// Get All Appointment List
router.get("/appointment-list", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await AppointmentFunctions.getAllAppointmentList(req.query)
    res.status(response['status']).json(response['data'])
})

// Reserve a New Appointment
router.post("/appointment", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await AppointmentFunctions.AddAppointment(req.body)
    res.status(response['status']).json(response['data'])
})

// Delete an Appointment
router.delete("/appointment", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await AppointmentFunctions.RemoveAppointment(req.body)
    res.status(response['status']).json(response['data'])
})

// Add New Note on an Appointment
router.post("/appointment-note", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await AppointmentFunctions.AddNewNote(req.body)
    res.status(response['status']).json(response['data'])
})

// Delete a Note
router.delete("/appointment-note", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await AppointmentFunctions.RemoveNote(req.body)
    res.status(response['status']).json(response['data'])
})

export default router

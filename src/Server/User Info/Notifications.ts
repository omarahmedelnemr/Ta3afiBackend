// Middle Functions
import { getCorsAccess } from '../../Middleware/cors'
import { Authenticate } from '../../Middleware/Auth'

//Main Modules
import { Router } from 'express'
import Notification from './Functions/NotificationFunctions'


const router = Router()

//-------------------------------------------------------------------------------------------
//--------------------------------- Patient Notifications -----------------------------------
//-------------------------------------------------------------------------------------------

// Send a Notification for a Patient  (used in Private Files as well, that Way Parameters are Hardcoded)
router.post("/send-patient-notification", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await  Notification.sendPatientNotification(req.body.patientID,req.body.category,req.body.header,req.body.text)
    res.status(response['status']).json(response['data'])
})

// Get The Count of All Unseen Patient Notifications
router.get("/patient-notification-count", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await  Notification.getPatientNotificationCount(req.query)
    res.status(response['status']).json(response['data'])
})

// Get The List of All Patient Notifications
router.get("/patient-notification", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await  Notification.getPatientNotificationList(req.query)
    res.status(response['status']).json(response['data'])
})

// Remove one Patient Notification
router.delete("/patient-notification", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await  Notification.removeOnePatientNotification(req.body)
    res.status(response['status']).json(response['data'])
})

// Clear All Patient Notification
router.delete("/all-patient-notification", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await  Notification.ClearAllPatientNotifications(req.body)
    res.status(response['status']).json(response['data'])
})

//-------------------------------------------------------------------------------------------
//--------------------------------- Doctor Notifications ------------------------------------
//-------------------------------------------------------------------------------------------

// Send a Notification for a Doctor  (used in Private Files as well, that Way Parameters are Hardcoded)
router.post("/send-doctor-notification", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await  Notification.sendDoctorNotification(req.body.patientID,req.body.category,req.body.header,req.body.text)
    res.status(response['status']).json(response['data'])
})

// Get The Count of All Unseen Doctor Notifications
router.get("/doctor-notification-count", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await  Notification.getDoctorNotificationCount(req.query)
    res.status(response['status']).json(response['data'])
})

// Get The List of All Doctor Notifications
router.get("/doctor-notification", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await  Notification.getDoctorNotificationList(req.query)
    res.status(response['status']).json(response['data'])
})

// Remove one Doctor Notification
router.delete("/doctor-notification", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await  Notification.removeOneDoctorNotification(req.body)
    res.status(response['status']).json(response['data'])
})

// Clear All Doctor Notification
router.delete("/all-doctor-notification", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await  Notification.ClearAllDoctorNotifications(req.body)
    res.status(response['status']).json(response['data'])
})


export default router
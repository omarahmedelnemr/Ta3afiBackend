import { getCorsAccess } from '../../Middleware/cors'
import adminFunctions from './Functions/adminFunctions'
import { AdminAuthenticate } from '../../Middleware/adminAuth'
import { Router } from 'express'

const router = Router()
const express = require('express');

const path = require('path')
router.use("/styles.css", express.static(path.join(__dirname, "../public/styles.css")));

//-------------------------------------------------------------------------------------------
//------------------------------------- General ---------------------------------------------
//-------------------------------------------------------------------------------------------

// Login Endpoint for Admins
router.post("/adminLogin", async (req, res) => {
    const response = await adminFunctions.adminLogin(req.body)
    res.status(response['status']).json(response['data'])
});

// Check Weather the Page Is Accessed From the Admin or Not Using The JWT Token
router.post("/checkAuth", AdminAuthenticate, async (req, res) => {
    res.status(200).json('authorized')
});


// Get a Patients Number
router.get("/patients-number", getCorsAccess, async (req,res)=>{
    const response = await adminFunctions.getPatientsNumber(req.query)
    res.status(response['status']).json(response['data'])
})

// Get a doctors Number
router.get("/doctors-number", getCorsAccess, async (req,res)=>{
    const response = await adminFunctions.getDoctorsNumber(req.query)
    res.status(response['status']).json(response['data'])
})

// Get a articles Number
router.get("/articles-number", getCorsAccess, async (req,res)=>{
    const response = await adminFunctions.getarticlesNumber(req.query)
    res.status(response['status']).json(response['data'])
})

// Get a Posts Number
router.get("/posts-number", getCorsAccess, async (req,res)=>{
    const response = await adminFunctions.getPostsNumber(req.query)
    res.status(response['status']).json(response['data'])
})

// Get a Posts Count Over a Given Period
router.get("/posts-overtime", getCorsAccess, async (req,res)=>{
    const response = await adminFunctions.getPostsOvertime(req.query)
    res.status(response['status']).json(response['data'])
})

// Get a Articles Count Over a Given Period
router.get("/articles-overtime", getCorsAccess, async (req,res)=>{
    const response = await adminFunctions.getArticlesOvertime(req.query)
    res.status(response['status']).json(response['data'])
})

// Get Appointments Count Over a Given Period
router.get("/appointments-overtime", getCorsAccess, async (req,res)=>{
    const response = await adminFunctions.getAppointmentsOvertime(req.query)
    res.status(response['status']).json(response['data'])
})

// Get the Appointment Statuses Counts
router.get("/appointment-status", getCorsAccess, async (req,res)=>{
    const response = await adminFunctions.getAppointmentStatus(req.query)
    res.status(response['status']).json(response['data'])
})

// Get a Supervisors List
router.get("/supervisors", getCorsAccess, async (req,res)=>{
    const response = await adminFunctions.GetAllSupervisors(req.query)
    res.status(response['status']).json(response['data'])
})

// Create a Signup Link For Supervisors
router.post("/supervisor-signup-link", getCorsAccess, async (req, res) => {
    const response = await adminFunctions.createSupervisorSignupLink(req.body);
    res.status(response['status']).json(response['data']);
});

// Add New Supervisor (Supervisor Signup)
router.post("/add-supervisor", getCorsAccess, async (req, res) => {
    const response = await adminFunctions.addNewSupervisor(req.body);
    res.status(response['status']).json(response['data']);
});

// Remove a Supervisor
router.delete("/remove-supervisor", getCorsAccess, async (req, res) => {
    const response = await adminFunctions.removeSupervisor(req.body);
    res.status(response['status']).json(response['data']);
});

// Add New Community Category
router.post("/new-community", getCorsAccess, async (req, res) => {
    const response = await adminFunctions.addNewCommunity(req.body);
    res.status(response['status']).json(response['data']);
});

// Add New Chat Plan
router.post("/new-chat_plan", getCorsAccess, async (req, res) => {
    const response = await adminFunctions.addNewChatPlan(req.body);
    res.status(response['status']).json(response['data']);
});

export default router

// Middle Functions
import { getCorsAccess } from '../Middleware/cors'
import { Authenticate } from '../Middleware/Auth'
import adminFunctions from './DB_Functions/adminFunctions'

//Main Modules
import { Router } from 'express'
const router = Router()
const express = require('express');

const path = require('path')
router.use("/styles.css", express.static(path.join(__dirname, "../public/styles.css")));

//-------------------------------------------------------------------------------------------
//------------------------------------- General ---------------------------------------------
//-------------------------------------------------------------------------------------------
router.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/dashboard.html"));
    // res.sendFile(path.join(__dirname, "./public/login/index.html"));
  });

// Get a General Info
router.get("/general", getCorsAccess, async (req,res)=>{
    const response = await adminFunctions.getGeneralData(req.query)
    res.status(response['status']).json(response['data'])
})

// Get a Supervisors List
router.get("/supervisors", getCorsAccess, async (req,res)=>{
    const response = await adminFunctions.GetAllSupervisors(req.query)
    res.status(response['status']).json(response['data'])
})

// Get Posts activity over Months
router.get("/posts-activity", getCorsAccess, async (req, res) => {
    const response = await adminFunctions.getPostsActivityOverTime(req.query);
    res.status(response['status']).json(response['data']);
});

// Get Article activity over Months
router.get("/article-activity", getCorsAccess, async (req, res) => {
    const response = await adminFunctions.getArticleActivityOverTime(req.query);
    res.status(response['status']).json(response['data']);
});

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

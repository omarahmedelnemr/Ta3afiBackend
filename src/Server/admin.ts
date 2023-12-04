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

export default router

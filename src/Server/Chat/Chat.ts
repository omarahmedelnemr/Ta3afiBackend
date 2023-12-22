// Middle Functions
import { getCorsAccess } from '../../Middleware/cors'
import { Authenticate } from '../../Middleware/Auth'

//Main Modules
import { Router } from 'express'
import chatFunctions from './Functions/chatFunctions'
const router = Router()

//-------------------------------------------------------------------------------------------
//------------------------------------- General ---------------------------------------------
//-------------------------------------------------------------------------------------------

// Create New Chatroom
router.post("/chatroom", getCorsAccess, async (req,res)=>{
    const response = await chatFunctions.CreateChatroom(req.body)
    res.status(response['status']).json(response['data'])
})

// Get All Chatroom List
router.get("/chatroom", getCorsAccess, async (req,res)=>{
    const response = await chatFunctions.GetAlChatrooms(req.query)
    res.status(response['status']).json(response['data'])
})

// Get All message List
router.get("/message", getCorsAccess, async (req,res)=>{
    const response = await chatFunctions.GetAllMessages(req.query)
    res.status(response['status']).json(response['data'])
})

// Get All unreaded message Count
router.get("/message-count", getCorsAccess, async (req,res)=>{
    const response = await chatFunctions.GetMessagesCount(req.query)
    res.status(response['status']).json(response['data'])
})

// Send New Message
router.post("/message", getCorsAccess, async (req,res)=>{
    const response = await chatFunctions.SendNewMessage(req.body)
    res.status(response['status']).json(response['data'])
})

// Get All Plans
router.get("/plans", getCorsAccess, async (req,res)=>{
    const response = await chatFunctions.GetAllChatPlans(req.query)
    res.status(response['status']).json(response['data'])
})

// Update Plan
router.post("/plan-update", getCorsAccess, async (req,res)=>{
    const response = await chatFunctions.RegisterInChatPlan(req.body)
    res.status(response['status']).json(response['data'])
})

export default router

// Middle Functions
import { getCorsAccess } from '../Middleware/cors'
import { Authenticate } from '../Middleware/Auth'

//Main Modules
import { Router } from 'express'
import chatFunctions from './DB_Functions/chatFunctions'
const router = Router()

//-------------------------------------------------------------------------------------------
//------------------------------------- General ---------------------------------------------
//-------------------------------------------------------------------------------------------

// Get All category List
router.post("/chatroom", getCorsAccess, async (req,res)=>{
    const response = await chatFunctions.CreateChatroom(req.body)
    res.status(response['status']).json(response['data'])
})

// Get All category List
router.get("/chatroom", getCorsAccess, async (req,res)=>{
    const response = await chatFunctions.GetAlChatrooms(req.query)
    res.status(response['status']).json(response['data'])
})

// Get All category List
router.get("/message", getCorsAccess, async (req,res)=>{
    const response = await chatFunctions.GetAllMessages(req.query)
    res.status(response['status']).json(response['data'])
})

// Get All category List
router.post("/message", getCorsAccess, async (req,res)=>{
    const response = await chatFunctions.SendNewMessage(req.body)
    res.status(response['status']).json(response['data'])
})


export default router

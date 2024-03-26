// Middle Functions
import { getCorsAccess } from '../../Middleware/cors'
import { Authenticate } from '../../Middleware/Auth'

//Main Modules
import { Router } from 'express'
import AI_Functions from './Functions/AI_Functions'
const router = Router()



// Base endpoint to Test That API is Working
router.get("/prompt",async (req,res)=>{
    const response = await  AI_Functions.getPromptResponse(req.query)
    res.status(response['status']).json(response['data'])
})

export default router
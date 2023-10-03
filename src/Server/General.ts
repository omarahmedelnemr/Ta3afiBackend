import { getCorsAccess } from '../Middleware/cors'
import { Authenticate } from '../Middleware/Auth'

//Main Modules
import { Router } from 'express'
import GeneralFunctions from './DB_Functions/GeneralFunctions'
const router = Router()


// Base endpoint to Test That API is Working
router.post('/login',async (req,res)=>{
    const response = await  GeneralFunctions.Login(req.body)
    res.status(response['status']).json(response['data'])
})

router.post("/doctorsignup",async (req,res)=>{
    
})


export default router
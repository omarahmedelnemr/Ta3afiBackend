// Middle Functions
import blogsFunctions from './DB_Functions/blogsFunctions'
import { getCorsAccess } from '../Middleware/cors'
import { Authenticate } from '../Middleware/Auth'

//Main Modules
import { Router } from 'express'
const router = Router()


// // Reset The Password with Authorization Check
// router.post("/reset-password",async (req,res)=>{
//     const response = await blogsFunctions.ResetPassword(req.body)
//     res.status(response['status']).json(response['data'])
// })


export default router

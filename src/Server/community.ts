// Middle Functions
import CommunityFunctions from './DB_Functions/communityFunctions'
import { getCorsAccess } from '../Middleware/cors'
import { Authenticate } from '../Middleware/Auth'

//Main Modules
import { Router } from 'express'
const router = Router()

//-------------------------------------------------------------------------------------------
//------------------------------------- General ---------------------------------------------
//-------------------------------------------------------------------------------------------

// Get All category List
// router.get("/category-list",async (req,res)=>{
//     const response = await CommunityFunctions.GetCategoriesList(req.query)
//     res.status(response['status']).json(response['data'])
// })

export default router

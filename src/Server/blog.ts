// Middle Functions
import blogsFunctions from './DB_Functions/blogsFunctions'
import { getCorsAccess } from '../Middleware/cors'
import { Authenticate } from '../Middleware/Auth'

//Main Modules
import { Router } from 'express'
const router = Router()

// Get All category List
router.get("/category-list",async (req,res)=>{
    const response = await blogsFunctions.GetCategoriesList(req.query)
    res.status(response['status']).json(response['data'])
})

// Make a Doctor Request a New Category
router.post("/request-new-category",async (req,res)=>{
    const response = await blogsFunctions.RequestNewCategory(req.body)
    res.status(response['status']).json(response['data'])
})

// Get All Article List for a Doctor
router.get("/article-list",async (req,res)=>{
    const response = await blogsFunctions.GetDoctorArticleList(req.query)
    res.status(response['status']).json(response['data'])
})

// Get a Single Article with Details
router.get("/article",async (req,res)=>{
    const response = await blogsFunctions.ViewAnArticle(req.query)
    res.status(response['status']).json(response['data'])
})

// Make a Doctor Post an Article
router.post("/article",async (req,res)=>{
    const response = await blogsFunctions.postNewArticle(req.body)
    res.status(response['status']).json(response['data'])
})

// Make a Doctor Edit an Article
router.post("/article-edit",async (req,res)=>{
    const response = await blogsFunctions.EditArticle(req.body)
    res.status(response['status']).json(response['data'])
})

// Make a Doctor Delete an Article
router.delete("/request-new-category",async (req,res)=>{
    const response = await blogsFunctions.DeleteArticle(req.body)
    res.status(response['status']).json(response['data'])
})

export default router

// Middle Functions
import { Authenticate } from '../Middleware/superAuth'
import { getCorsAccess } from '../Middleware/cors'


//Main Modules
import { Router } from 'express'
import SupervisorFunction from './DB_Functions/supervisorFunction'
const router = Router()


// Get All Un-Approved Categories
router.get("/unapproved-categories", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await SupervisorFunction.getAllSuggestedBlogCategories()
    res.status(response['status']).json(response['data'])
})

// Take a Desecion Weather Approve or Disapprove a Category
router.post("/category-decision", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await SupervisorFunction.approve_disapprove_category(req.body)
    res.status(response['status']).json(response['data'])
})

// Get All Un-Approved Posts
router.get("/unapproved-posts", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await SupervisorFunction.getAllunapprovedPosts()
    res.status(response['status']).json(response['data'])
})

// Take a Desecion Weather Approve or Disapprove a Post
router.post("/post-decision", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await SupervisorFunction.approve_disapprove_post(req.body)
    res.status(response['status']).json(response['data'])
})

// Remove a Post From Posts Lists (With a Message)
router.delete("/post", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await SupervisorFunction.Remove_post(req.body)
    res.status(response['status']).json(response['data'])
})

// Remove a Comment From Posts Lists (With a Message)
router.delete("/post-comment", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await SupervisorFunction.Remove_comment(req.body)
    res.status(response['status']).json(response['data'])
})

export default router

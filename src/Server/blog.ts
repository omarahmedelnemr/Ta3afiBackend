// Middle Functions
import blogsFunctions from './DB_Functions/blogsFunctions'
import { getCorsAccess } from '../Middleware/cors'
import { Authenticate } from '../Middleware/Auth'

//Main Modules
import { Router } from 'express'
const router = Router()

//-------------------------------------------------------------------------------------------
//------------------------------------- General ---------------------------------------------
//-------------------------------------------------------------------------------------------

// Get All category List
router.get("/category-list",async (req,res)=>{
    const response = await blogsFunctions.GetCategoriesList(req.query)
    res.status(response['status']).json(response['data'])
})

// Search For all Posts Using category Delete a Comment like
router.get("/article-list",async (req,res)=>{
    const response = await blogsFunctions.GetAllArticleList(req.query)
    res.status(response['status']).json(response['data'])
})

// Search for Articles By Using its Title
router.get("/article-by-title",async (req,res)=>{
    const response = await blogsFunctions.SearchForArticleByTitle(req.query)
    res.status(response['status']).json(response['data'])
})

// Get a Single Article with Details
router.get("/article",async (req,res)=>{
    const response = await blogsFunctions.ViewAnArticle(req.query)
    res.status(response['status']).json(response['data'])
})

// Get Comments List For an Article
router.get("/comment-list",async (req,res)=>{
    const response = await blogsFunctions.GetArticleComments(req.query)
    res.status(response['status']).json(response['data'])
})

//-------------------------------------------------------------------------------------------
//------------------------------- Doctor Article Handling -----------------------------------
//-------------------------------------------------------------------------------------------

// Make a Doctor Request a New Category
router.post("/request-new-category",async (req,res)=>{
    const response = await blogsFunctions.RequestNewCategory(req.body)
    res.status(response['status']).json(response['data'])
})

// Get All Article List for a Doctor
router.get("/doctor-article-list",async (req,res)=>{
    const response = await blogsFunctions.GetDoctorArticleList(req.query)
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
router.delete("/article",async (req,res)=>{
    const response = await blogsFunctions.DeleteArticle(req.body)
    res.status(response['status']).json(response['data'])
})

//-------------------------------------------------------------------------------------------
//----------------------------------- Article Ranks -----------------------------------------
//-------------------------------------------------------------------------------------------

// Doctor Can Upvote for Other Doctor's Article
router.post("/doctor-upvote-article",async (req,res)=>{
    const response = await blogsFunctions.DoctorUpVote(req.body)
    res.status(response['status']).json(response['data'])
})

// Make a Doctor Delete an Article Up Vote
router.delete("/doctor-upvote-article",async (req,res)=>{
    const response = await blogsFunctions.RemoveDoctorUpvote(req.body)
    res.status(response['status']).json(response['data'])
})

// Doctor Can Upvote for Other Doctor's Article
router.post("/patient-upvote-article",async (req,res)=>{
    const response = await blogsFunctions.PatientUpVote(req.body)
    res.status(response['status']).json(response['data'])
})

// Make a Doctor Delete an Article
router.delete("/patient-upvote-article",async (req,res)=>{
    const response = await blogsFunctions.RemovePatientUpvote(req.body)
    res.status(response['status']).json(response['data'])
})

//-------------------------------------------------------------------------------------------
//----------------------------------- Article Comments --------------------------------------
//-------------------------------------------------------------------------------------------

// Doctor add Comment to an Article
router.post("/doctor-comment",async (req,res)=>{
    const response = await blogsFunctions.DoctorAddComment(req.body)
    res.status(response['status']).json(response['data'])
})

// Doctor Delete his Comments
router.delete("/doctor-comment",async (req,res)=>{
    const response = await blogsFunctions.RemoveDoctorComment(req.body)
    res.status(response['status']).json(response['data'])
})

// Doctor like a Comment
router.post("/doctor-comment-like",async (req,res)=>{
    const response = await blogsFunctions.DoctorLikeComment(req.body)
    res.status(response['status']).json(response['data'])
})

// Doctor Delete a Comment like
router.delete("/doctor-comment-like",async (req,res)=>{
    const response = await blogsFunctions.RemoveCommentLike(req.body)
    res.status(response['status']).json(response['data'])
})

//-------------------------------------------------------------------------------------------
//---------------------------------- Article Saved List -------------------------------------
//-------------------------------------------------------------------------------------------


// Patient Get his Saved List
router.get("/saved-list",async (req,res)=>{
    const response = await blogsFunctions.GetAllSavedList(req.query)
    res.status(response['status']).json(response['data'])
})

// Patient Save an Article to SavedList
router.post("/save-article",async (req,res)=>{
    const response = await blogsFunctions.saveArticleToSavedList(req.body)
    res.status(response['status']).json(response['data'])
})

// Patient delete an Article front SavedList
router.delete("/save-article",async (req,res)=>{
    const response = await blogsFunctions.RemoveArticleFromSavedList(req.body)
    res.status(response['status']).json(response['data'])
})
export default router

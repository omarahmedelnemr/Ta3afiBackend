// Middle Functions
import CommunityFunctions from './Functions/communityFunctions'
import { getCorsAccess } from '../../Middleware/cors'
import { Authenticate } from '../../Middleware/Auth'

//Main Modules
import { Router } from 'express'
const router = Router()

//-------------------------------------------------------------------------------------------
//--------------------------------- General Post Viewing ------------------------------------
//-------------------------------------------------------------------------------------------

// Get All community List
router.get("/community-list", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.GetCommunitiesList(req.query)
    res.status(response['status']).json(response['data'])
})

// Search For all Posts Using community
router.get("/post-feed", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.GetPostsFeed(req.query)
    res.status(response['status']).json(response['data'])
})

// // Search for posts By Using its Title
// router.get("/post-by-text", getCorsAccess, Authenticate, async (req,res)=>{
//     const response = await CommunityFunctions.SearchForPostByText(req.query)
//     res.status(response['status']).json(response['data'])
// })

// Get All posts That A Spisific Patient Posts
router.get("/patient-posts", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.GetPatientPosts(req.query)
    res.status(response['status']).json(response['data'])
})

//-------------------------------------------------------------------------------------------
//-------------------------------------- Post Edits -----------------------------------------
//-------------------------------------------------------------------------------------------

// Get Comments List For an post
router.post("/new-post", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.WritePost(req.body)
    res.status(response['status']).json(response['data'])
})

// Edit an Existing Post
router.post("/edit-post", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.EditPost(req.body)
    res.status(response['status']).json(response['data'])
})

// Delete a Post
router.delete("/post", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.DeletePost(req.body)
    res.status(response['status']).json(response['data'])
})

//-------------------------------------------------------------------------------------------
//------------------------------------ Post Actions -----------------------------------------
//-------------------------------------------------------------------------------------------

// Add a Reaction on a Post
router.post("/post-reaction", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.ReactOnPost(req.body)
    res.status(response['status']).json(response['data'])
})

// Remove a Reaction from a Post
router.delete("/post-reaction", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.RemoveReactOnPost(req.body)
    res.status(response['status']).json(response['data'])
})

// Get Comments List For an post
router.get("/comment-list", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.GetPostComments(req.query)
    res.status(response['status']).json(response['data'])
})

// Add a Comment on a Post
router.post("/post-comment", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.AddComment(req.body)
    res.status(response['status']).json(response['data'])
})

// Remove a Comment from a Post
router.delete("/post-comment", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.RemoveComment(req.body)
    res.status(response['status']).json(response['data'])
})

// Add a Reaction on a Comment
router.post("/post-comment-reaction", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.ReactOnComment(req.body)
    res.status(response['status']).json(response['data'])
})

// Remove  a Reaction From a Comment
router.delete("/post-comment-reaction", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.RemoveCommentReaction(req.body)
    res.status(response['status']).json(response['data'])
})

//-------------------------------------------------------------------------------------------
//------------------------------------ Saved Posts ------------------------------------------
//-------------------------------------------------------------------------------------------

// Get All Saved-List Posts
router.get("/save-post-list", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.GetAllSavedList(req.query)
    res.status(response['status']).json(response['data'])
})

// Add a Post to Saved List
router.post("/save-post", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.savePostToSavedList(req.body)
    res.status(response['status']).json(response['data'])
})

// Remove a Post from Saved List
router.delete("/save-post", getCorsAccess, Authenticate, async (req,res)=>{
    const response = await CommunityFunctions.RemovePostFromSavedList(req.body)
    res.status(response['status']).json(response['data'])
})

export default router

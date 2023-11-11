import { Database } from "../../data-source";
import { Community } from "../../entity/community/Community";
import { Post } from "../../entity/community/Post";
import { PostComment } from "../../entity/community/PostComment";
import { PostCommentsReaction } from "../../entity/community/PostCommentReaction";
import { PostImages } from "../../entity/community/PostImages";
import { PostReaction } from "../../entity/community/PostReaction";
import { SavedPost } from "../../entity/community/SavedPost";
import { Patient } from "../../entity/users/Patient";
import checkUndefined from "../../middleFunctions/checkUndefined";
import responseGenerater from "../../middleFunctions/commonResposes";


class CommunityFunctions{

    //-------------------------------------------------------------------------------------------
    //--------------------------------- General Post Viewing ------------------------------------
    //-------------------------------------------------------------------------------------------

    // Get All Approved Communities List
    async GetCommunitiesList(reqData){
        try{
            // Get All The List of Communities
            const communitiesList = await  Database.getRepository(Community).findBy({approved:true})
            return responseGenerater.sendData(communitiesList)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Get all Posts With a Category or Not
    async GetPostsFeed(reqData){
        if(checkUndefined(reqData,['loadBlock'])){
            return responseGenerater.missingParam
        }
        try{
            var allPosts;

            // Getting all PostS Without Community Classification
            if (reqData["communityID"] === undefined ){
                allPosts = await Database.getRepository(Post)
                .createQueryBuilder("Post")
                .innerJoinAndSelect("Post.patient","patient")
                .innerJoinAndSelect("Post.community","community")
                .andWhere("Post.approved = true")
                .select([
                    "Post.id as id",
                    "Post.date as date",
                    "Post.views as views",
                    "Post.edited as edited",
                    "Post.mainText as mainText",
                    "Post.hideIdentity as hideIdentity",
                    "community.name as community",
                    "patient.name as userName",
                    "patient.profileImage as userProfileImage",
                ])
                .orderBy('Post.date', 'DESC')
                .limit(15)
                .offset(15* (Number(reqData['loadBlock'])-1))
                .getRawMany()
            }

            // Getting a specific Community Posts
            else{
                allPosts = await Database.getRepository(Post)
                .createQueryBuilder("Post")
                .innerJoinAndSelect("Post.patient","patient")
                .innerJoinAndSelect("Post.community","community")
                .where("community.id = :communityID" ,{communityID:reqData['communityID']})
                .andWhere("Post.approved = true")
                .select([
                    "Post.id as id",
                    "Post.date as date",
                    "Post.views as views",
                    "Post.edited as edited",
                    "Post.mainText as mainText",
                    "Post.hideIdentity as hideIdentity",
                    "community.name as community",
                    "patient.name as userName",
                    "patient.profileImage as userProfileImage",
                ])
                .limit(15)
                .offset(15* (Number(reqData['loadBlock'])-1))
                .getRawMany()
            }

            // adding Reactions Number
            for (var i=0;i<allPosts.length;i++){
                allPosts[i]["images"] = await Database.getRepository(PostImages).findBy({post:{id:allPosts[i].id}})
                allPosts[i]["commentsNumber"] = await Database.getRepository(PostComment).countBy({post:{id:allPosts[i].id}})
                allPosts[i]["reactions"] = await Database.getRepository(PostReaction)
                .createQueryBuilder('PostReaction')
                .where("PostReaction.post.id = :postID",{postID:allPosts[i].id})
                .groupBy("PostReaction.reaction")
                .select(['PostReaction.reaction as reaction'])
                .addSelect("COUNT(*)",'count')
                .getRawMany()
            }
            return responseGenerater.sendData(allPosts)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }
    
    // Search for an Post By Its Text (main Text)
    async SearchForPostByText(reqData){
        if (checkUndefined(reqData,['searchText','loadBlock'])){
            return responseGenerater.missingParam
        }
        try{
            const allPosts = await Database.getRepository(Post)
            .createQueryBuilder("Post")
            .innerJoinAndSelect("Post.patient","patient")
            .innerJoinAndSelect("Post.community","community")
            .where("community.id = :communityID" ,{communityID:reqData['communityID']})
            .andWhere("Post.approved = true")
            .andWhere("Post.mainText like :searchText",{searchText:"%"+reqData['searchText']+"%"})
            .select([
                "Post.id as id",
                "Post.date as date",
                "Post.views as views",
                "Post.edited as edited",
                "Post.mainText as mainText",
                "community.name as community",
                "patient.name as userName",
                "patient.profileImage as userProfileImage",
            ])
            .orderBy('Post.date', 'DESC')
            .limit(15)
            .offset(15* (Number(reqData['loadBlock'])-1))
            .getRawMany()

            // adding Reactions Number
            for (var i=0;i<allPosts.length;i++){
                allPosts[i]["images"] = await Database.getRepository(PostImages).findBy({post:{id:allPosts[i].id}})
                allPosts[i]["commentsNumber"] = await Database.getRepository(PostComment).countBy({post:{id:allPosts[i].id}})
                allPosts[i]["reactions"] = await Database.getRepository(PostReaction)
                .createQueryBuilder('PostReaction')
                .where("PostReaction.post.id = :postID",{postID:allPosts[i].id})
                .groupBy("PostReaction.reaction")
                .select(['PostReaction.reaction as reaction'])
                .addSelect("COUNT(*)",'count')
                .getRawMany()
            }
            return responseGenerater.sendData(allPosts)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

    // Get a User's Post That He Posts
    async GetPatientPosts(reqData){
        if(checkUndefined(reqData,['patientID',"loadBlock"])){
            return  responseGenerater.missingParam
        }
        try{
            // Getting All Posts Related to a User
            const allPosts = await Database.getRepository(Post)
            .createQueryBuilder("Post")
            .innerJoinAndSelect("Post.patient","patient")
            .innerJoinAndSelect("Post.community","community")
            .where("Post.patient.id = :patientID" ,{patientID:reqData['patientID']})
            .select([
                "Post.id as id",
                "Post.date as date",
                "Post.views as views",
                "Post.edited as edited",
                "Post.mainText as mainText",
                "Post.hideIdentity as hideIdentity",
                "Post.approved as approved",
                "community.name as community",
                "patient.name as userName",
                "patient.profileImage as userProfileImage",
            ])
            .limit(15)
            .offset(15* (Number(reqData['loadBlock'])-1))
            .getRawMany()

            // adding Reactions Number
            for (var i=0;i<allPosts.length;i++){
                allPosts[i]["images"] = await Database.getRepository(PostImages).findBy({post:{id:allPosts[i].id}})
                allPosts[i]["commentsNumber"] = await Database.getRepository(PostComment).countBy({post:{id:allPosts[i].id}})
                allPosts[i]["reactions"] = await Database.getRepository(PostReaction)
                .createQueryBuilder('PostReaction')
                .where("PostReaction.post.id = :postID",{postID:allPosts[i].id})
                .groupBy("PostReaction.reaction")
                .select(['PostReaction.reaction as reaction'])
                .addSelect("COUNT(*)",'count')
                .getRawMany()
            }
            return responseGenerater.sendData(allPosts)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    //-------------------------------------------------------------------------------------------
    //-------------------------------------- Post Edits -----------------------------------------
    //-------------------------------------------------------------------------------------------

    // User can Write a Post
    async WritePost(reqData){
        if (checkUndefined(reqData,["patientID","communityID","mainText",'date','hideIdentity'])){
            return responseGenerater.missingParam
        }
        try{
            // Create New Post Entity
            const newPost        = new Post()
            newPost.mainText     = reqData['mainText']
            newPost.date         = new Date(reqData['date'])
            newPost.hideIdentity = reqData['hideIdentity']
            newPost.patient      = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            newPost.community      = await Database.getRepository(Community).findOneBy({id:reqData['communityID']})


            // Check if the Data is Wrong
            if (newPost.patient === null || newPost.community === null){
                return responseGenerater.custom(403,"The Data you Entered is Wrong")
            }

            //Save Post To DB
            await Database.getRepository(Post).save(newPost)

            // saveing Attached Images if Eny
            if (reqData['attachedImages'] !== undefined){
                for(var image of reqData['attachedImages']){
                    const newImage = new PostImages()
                    newImage.post = newPost
                    newImage.name = image['name']
                    newImage.link = image['link']
                    await Database.getRepository(PostImages).save(newImage)
                }
            }
            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Edit an Existing Post
    async EditPost(reqData){
        if (checkUndefined(reqData,["patientID","postID","communityID","mainText",'editDate','hideIdentity'])){
            return responseGenerater.missingParam
        }
        try{
            // Get and Check The Post Info
            const myPost        = await Database.getRepository(Post).findOneBy({id:reqData['postID'],patient:{id:reqData['patientID']}})
            if (myPost === null){
                return responseGenerater.notFound
            }

            myPost.mainText     = reqData['mainText']
            myPost.editDate         = new Date(reqData['editDate'])
            myPost.hideIdentity = reqData['hideIdentity']
            myPost.patient      = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            myPost.community    = await Database.getRepository(Community).findOneBy({id:reqData['communityID']})
            myPost.edited       = true

            // Check if the Data is Wrong
            if (myPost.patient === null || myPost.community === null){
                return responseGenerater.custom(403,"The Data you Entered is Wrong")
            }

            //Save Post To DB
            await Database.getRepository(Post).save(myPost)

            /// Delete and Reset Post Images if Eny
            // Delete the Post Comments Likes
            await Database.getRepository(PostImages)
            .createQueryBuilder('PostImages')
            .delete()
            .from(PostImages)
            .where("post.id = :postID", { postID: reqData['postID'] })
            .execute()

            // saveing Attached Images if Eny
            if (reqData['attachedImages'] !== undefined){
                for(var image of reqData['attachedImages']){
                    const newImage = new PostImages()
                    newImage.post = myPost
                    newImage.name = image['name']
                    newImage.link = image['link']
                    await Database.getRepository(PostImages).save(newImage)
                }
            }
            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Delete a Post With the Related Data
    async DeletePost(reqData){
        // Check Parameter Existence
        if (checkUndefined(reqData,['postID','patientID'])){
            return responseGenerater.missingParam
        }
        try{
            // Check If Post Exist
            const post = await Database.getRepository(Post).findOneBy({id:reqData['postID'],patient:{id:reqData['patientID']}})
            if(post === null){
                return responseGenerater.notFound
            }
            
            //// Delete Related Data

            // Delete the Post Related Comments Reactions
            await Database.getRepository(PostCommentsReaction)
            .createQueryBuilder('PostCommentsReaction')
            .delete()
            .from(PostCommentsReaction)
            .where("post.id = :postID", { postID: reqData['postID'] })
            .execute()

            // Delete the Post Related Comments 
            await Database.getRepository(PostComment)
            .createQueryBuilder('PostComment')
            .delete()
            .from(PostComment)
            .where("post.id = :postID", { postID: reqData['postID'] })
            .execute()

            // Delete the Post Related Reactions 
            await Database.getRepository(PostReaction)
            .createQueryBuilder('PostReaction')
            .delete()
            .from(PostReaction)
            .where("post.id = :postID", { postID: reqData['postID'] })
            .execute()

            // Delete the Post Related Images 
            await Database.getRepository(PostImages)
            .createQueryBuilder('PostImages')
            .delete()
            .from(PostImages)
            .where("post.id = :postID", { postID: reqData['postID'] })
            .execute()

            // Delete the Post From All Saved-List
            await Database.getRepository(SavedPost)
            .createQueryBuilder('SavedPost')
            .delete()
            .from(SavedPost)
            .where("post.id = :postID", { postID: reqData['postID'] })
            .execute()

            // Delete the Post
            await Database.getRepository(Post)
            .createQueryBuilder('Post')
            .delete()
            .from(Post)
            .where("id = :postID", { postID: reqData['postID'] })
            .andWhere("patient.id = :patientID",{ patientID: reqData['patientID']})
            .execute()

            return responseGenerater.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        } 
    }

    //-------------------------------------------------------------------------------------------
    //------------------------------------ Post Actions -----------------------------------------
    //-------------------------------------------------------------------------------------------

    // Patient React on a Post
    async ReactOnPost(reqData){
        if(checkUndefined(reqData,['patientID',"postID","reaction"])){
            return  responseGenerater.missingParam
        }
        try{
            const newReaction    = new PostReaction()
            newReaction.patient  = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            newReaction.post     = await Database.getRepository(Post).findOneBy({id:reqData['postID']})
            newReaction.reaction = reqData['reaction'].toLowerCase()

            // Check if Data Was Wrong
            if (newReaction.patient === null || newReaction.post === null){
                return responseGenerater.custom(403,"The Data you Entered is Wrong")
            }

            // Save The Reaction to the DB
            await Database.getRepository(PostReaction).save(newReaction)
            
            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Patient can Remove React on a Post
    async RemoveReactOnPost(reqData){
        if(checkUndefined(reqData,['patientID',"postID"])){
            return  responseGenerater.missingParam
        }
        try{
            const newReaction    = await Database.getRepository(PostReaction).findOneBy({post:{id:reqData['postID']},patient:{id:reqData['patientID']}})

            // Check if Data Was Missing
            if (newReaction === null){
                return responseGenerater.missingParam
            }


            // Delete the Post Related Reactions 
            await Database.getRepository(PostReaction)
            .createQueryBuilder('PostReaction')
            .delete()
            .from(PostReaction)
            .where("post.id = :postID", { postID: reqData['postID'] })
            .andWhere("patient.id = :patientID", { patientID: reqData['patientID'] })
            .execute()
            
            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Get All Post Comments
    async GetPostComments(reqData){
        if(checkUndefined(reqData,['postID','loadBlock'])){
            return  responseGenerater.missingParam
        }
        try{
            const commmentList = await Database.getRepository(PostComment)
            .createQueryBuilder("Comment")
            .innerJoinAndSelect("Comment.patient","patient")
            .where("Comment.post = :postID",{postID:reqData['postID']})
            .select([
                "Comment.id as id",
                "Comment.comment as comment",
                "Comment.date as date",
                "patient.id as patientID",
                "patient.name as patientName",
                "patient.profileImage as patientProfileImage",
            ])
            .orderBy('Comment.date', 'DESC')
            .limit(15)
            .offset(15* (Number(reqData['loadBlock'])-1))
            .getRawMany()

            for (var i=0;i< commmentList.length;i++){
                commmentList[i]['reactions'] = await Database.getRepository(PostCommentsReaction)
                .createQueryBuilder('comment')
                .where("comment.id = :commentID",{commentID:commmentList[i].id})
                .groupBy("comment.reaction")
                .select(['comment.reaction as reaction'])
                .addSelect("COUNT(*)",'count')
                .getRawMany()
                
            }

            return responseGenerater.sendData(commmentList)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Patient Can Comment on a Post
    async AddComment(reqData){
        if(checkUndefined(reqData,['patientID',"postID","comment","date"])){
            return  responseGenerater.missingParam
        }
        try{
            // Get the Patient and Post Info
            const patientInfo = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            const postInfo = await Database.getRepository(Post).findOneBy({id:reqData['postID']})
            
            // Check if Eny Thing is Missing
            if (patientInfo === null || postInfo === null){
                return responseGenerater.notFound
            }
            
            // Creating the New Comment
            const newComment    = new PostComment()
            newComment.post     = postInfo
            newComment.patient  = patientInfo
            newComment.comment  = reqData['comment']
            newComment.date     = new Date(reqData["date"])
            
            // Save It To DB
            await Database.getRepository(PostComment).save(newComment)
            
            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Patient Remove his Comment
    async RemoveComment(reqData){
        if(checkUndefined(reqData,["patientID",'commentID'])){
            return  responseGenerater.missingParam
        }
        try{
            // Get Comment Info
            const comment = await Database.getRepository(PostComment)
            .createQueryBuilder("comment")
            .where("comment.id = :commentID",{commentID : reqData['commentID']})
            .innerJoinAndSelect("comment.patient","patient")
            .getOne()

            if (comment === null){
                return responseGenerater.notFound
            }else if(comment.patient.id !== reqData["patientID"]){
                return responseGenerater.custom(401,"You are Not Autherized to Delete this Comment")
            }

            // Delete the Reactions Related to the Comment
            await Database.getRepository(PostCommentsReaction)
            .createQueryBuilder('PostCommentsReaction')
            .delete()
            .from(PostCommentsReaction)
            .where("comment.id = :commentID",{commentID : reqData['commentID']})
            .execute()

            // Delete the Comment
            await Database.getRepository(PostComment)
            .createQueryBuilder('PostComment')
            .delete()
            .from(PostComment)
            .where("id = :commentID",{commentID : reqData['commentID']})
            .execute()


            return responseGenerater.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Pateint can Add Reactions to a comment
    async ReactOnComment(reqData){
        if(checkUndefined(reqData,['patientID','commentID',"reaction"])){
            return  responseGenerater.missingParam
        }
        try{
            // Check if The Patient React on it Already
            const like = await Database.getRepository(PostCommentsReaction).findOneBy({comment:{id:reqData['commentID']},patient:{id:reqData['patientID']}})
            
            if(like !== null){
                return responseGenerater.sendError("You Alreay Liked This Comment")
            }

            // Get the post Info
            const post = await Database.getRepository(PostComment)
            .createQueryBuilder("PostComment")
            .where("PostComment.id = :commentID",{commentID:reqData['commentID']})
            .innerJoinAndSelect("PostComment.post","post")
            .getOne()
            
            // Check if the Data Exist
            if (post === null ){
                return responseGenerater.notFound
            }

            // Creating New Entity
            const newLike    = new PostCommentsReaction()
            newLike.reaction = reqData['reaction'].toLowerCase()
            newLike.comment  = await Database.getRepository(PostComment).findOneBy({id:reqData['commentID']})
            newLike.patient  = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            newLike.post     = post.post

            // Check if the Data Exist
            if (newLike.patient === null || newLike.patient=== null){
                return responseGenerater.notFound
            }
            
            // Save to DB
            await Database.getRepository(PostCommentsReaction).save(newLike)

            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Remove a Reaction from A Comment
    async RemoveCommentReaction(reqData){
        if(checkUndefined(reqData,['commentID',"patientID"])){
            return  responseGenerater.missingParam
        }
        try{
            // Check if The Patient React on it Already
            const like = await Database.getRepository(PostCommentsReaction).findOneBy({comment:{id:reqData['commentID']},patient:{id:reqData['patientID']}})
            if(like === null){
                return responseGenerater.sendError("You Didn't Liked This Comment")
            }
            
            //Remove the Like
            await Database.getRepository(PostCommentsReaction)
            .createQueryBuilder('PostCommentsReaction')
            .delete()
            .from(PostCommentsReaction)
            .where("comment.id = :commentID",{commentID : reqData['commentID']})
            .andWhere("patient.id = :patientID",{patientID : reqData['patientID']})
            .execute()

            return responseGenerater.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

    //-------------------------------------------------------------------------------------------
    //------------------------------------ Saved Posts ------------------------------------------
    //-------------------------------------------------------------------------------------------

    // Patient Saving this Post in Saved List
    async GetAllSavedList(reqData){
        if (checkUndefined(reqData,['patientID',"loadBlock"])){
            return responseGenerater.missingParam
        }
        try{
            // get and Send the List
            const postList = await Database.getRepository(SavedPost)
                .createQueryBuilder("Saved")
                .innerJoinAndSelect("Saved.post","Post")
                .innerJoinAndSelect("Post.patient","patient")
                .innerJoinAndSelect("Post.community","community")
                .andWhere("Post.approved = true")
                .select([
                    "Post.id as id",
                    "Post.date as date",
                    "Post.views as views",
                    "Post.edited as edited",
                    "Post.mainText as mainText",
                    "Post.hideIdentity as hideIdentity",
                    "community.name as community",
                    "patient.name as userName",
                    "patient.profileImage as userProfileImage",
                ])
                .limit(15)
                .offset(15* (Number(reqData['loadBlock'])-1))
                .getRawMany()


            return responseGenerater.sendData(postList)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

    // Patient Saving this Post in Saved List
    async savePostToSavedList(reqData){
        if (checkUndefined(reqData,['patientID',"postID"])){
            return responseGenerater.missingParam
        }
        try{
            // Check if the User Didn't Save it Already
            const savedCheck = await Database.getRepository(SavedPost).findOneBy({post:{id:reqData['postID']},patient:{id:reqData['patientID']}})
            if(savedCheck !== null){
                return responseGenerater.sendError("You Have Already Saved This Post")
            }

            // Make New Saved Entity
            const newSave = new SavedPost()
            newSave.post = await Database.getRepository(Post).findOneBy({id:reqData["postID"]})
            newSave.patient = await Database.getRepository(Patient).findOneBy({id:reqData["patientID"]})
            
            // check if The Data is Wrong
            if (newSave.post === null || newSave.patient === null){
                return responseGenerater.custom(403,"The Data you Entered is Wrong")
            }

            // Save it to DB
            await Database.getRepository(SavedPost).save(newSave)

            return responseGenerater.done 
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

    // Patient Remove this Post From Saved List
    async RemovePostFromSavedList(reqData){
        if (checkUndefined(reqData,['patientID',"postID"])){
            return responseGenerater.missingParam
        }
        try{
            // Make New Saved Entity
            const saved = await Database.getRepository(SavedPost).findOneBy({post:{id:reqData['postID']},patient:{id:reqData["patientID"]}})

            // Check undefined
            if (saved === null){
                return responseGenerater.notFound
            }

            // Remove the Post
            await Database.getRepository(SavedPost)
            .createQueryBuilder('SavedPost')
            .delete()
            .from(SavedPost)
            .where("post.id = :postID",{postID : reqData['postID']})
            .andWhere("patient.id = :patientID",{patientID : reqData['patientID']})
            .execute()
        

            return responseGenerater.done 
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

}


// if(checkUndefined(reqData,[''])){
//     return  responseGenerater.missingParam
// }
// try{

// }catch(err){
//     console.log("Error!\n",err)
//     return responseGenerater.Error
// }



export default new CommunityFunctions();

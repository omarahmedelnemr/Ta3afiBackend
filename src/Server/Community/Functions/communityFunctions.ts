import { Database } from "../../../data-source";
import { Community } from "../Tables/Community";
import { Post } from "../Tables/Post";
import { PostComment } from "../Tables/PostComment";
import { PostCommentsReaction } from "../Tables/PostCommentReaction";
import { PostImages } from "../Tables/PostImages";
import { PostReaction } from "../Tables/PostReaction";
import { SavedPost } from "../Tables/SavedPost";
import { Patient } from "../../User Info/Tables/Users/Patient";
import checkUndefined from "../../../Public Functions/checkUndefined";
import responseGenerater from "../../../Public Functions/responseGenerator";
import NotificationFunctions from "../../User Info/Functions/NotificationFunctions";
import { DefualtAIChat } from "../../../Middleware/GenAI";
import parse_AI_Text from "../../../Middleware/ParseAIText";


class CommunityFunctions{

    //-------------------------------------------------------------------------------------------
    //--------------------------------- General Post Viewing ------------------------------------
    //-------------------------------------------------------------------------------------------
    async getCommonQueryBuilder  (loadBlock){
        return Database.getRepository(Post)
          .createQueryBuilder("Post")
          .innerJoinAndSelect("Post.patient", "patient")
          .innerJoinAndSelect("Post.community", "community")
          .andWhere("Post.approved = true")
          .andWhere("Post.deleted = false")
          .select([
            "Post.id as id",
            "Post.date as date",
            "Post.views as views",
            "Post.edited as edited",
            "Post.mainText as mainText",
            "Post.AI_saftyRate as AI_saftyRate",
            "Post.AI_saftyWord as AI_saftyWord",
            "Post.hideIdentity as hideIdentity",
            "community.name as community",
            "patient.id as patientID",
            "patient.name as userName",
            "patient.profileImage as userProfileImage",
          ])
          .orderBy('Post.date', 'DESC')
          .limit(15)
          .offset(15 * (Number(loadBlock) - 1));
      };

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

        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['loadBlock',"patientID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            var baseRepo = await this.getCommonQueryBuilder(reqData['loadBlock']);
            var allPosts;
            ////  Filtering Posts
            // Getting a specific Community Posts
            if (reqData["communityID"] !== undefined ){
                baseRepo = baseRepo
                .andWhere("community.id = :communityID", { communityID: reqData['communityID'] })
                
            }
            // Getting Posts With a specific Text in them
            if (reqData["searchText"] !== undefined ){
                baseRepo = baseRepo
                .andWhere("Post.mainText like :searchText", { searchText: "%" + reqData['searchText'] + "%" })
            }
            allPosts = await baseRepo.getRawMany()


            // adding Reactions Number
            for (var i=0;i<allPosts.length;i++){
                allPosts[i]["images"] = await Database.getRepository(PostImages).findBy({post:{id:allPosts[i].id}})
                allPosts[i]["commentsNumber"] = await Database.getRepository(PostComment).countBy({post:{id:allPosts[i].id},deleted:false})
                allPosts[i]["reactions"] = await Database.getRepository(PostReaction)
                .createQueryBuilder('PostReaction')
                .where("PostReaction.post.id = :postID",{postID:allPosts[i].id})
                .getCount()

                allPosts[i]["likedByUser"] = await Database.getRepository(PostReaction).findOneBy({post:{id:allPosts[i].id},patient:{id:reqData['patientID']}})?true:false

                // Increase Post View in Normal Mode, Not in Admin or Dev Modes
                if(reqData['effect']!=='0'){
                    const singlePost = await Database.getRepository(Post).findOneBy({id:allPosts[i].id})
                    singlePost.views+=1
                    await Database.getRepository(Post).save(singlePost)
                }
                // Remove Identitity if hideIdentity
                if (allPosts[i]['hideIdentity'] === 1){
                    allPosts[i]['userName'] = null
                    allPosts[i]['userProfileImage'] = null
                }
            }
            return responseGenerater.sendData(allPosts)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }
    
    // Get all Posts With a Category or Not
    async GetAdminPostsFeed(reqData){
        
        return this.GetPostsFeed({...reqData,patientID:null})
    }


    // Get a User's Post That He Posts
    async GetPatientPosts(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["patientID",'loadBlock'])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Getting All Posts Related to a User
            const allPosts = await (await this.getCommonQueryBuilder(reqData['loadBlock']))
            .where("Post.patient.id = :patientID", { patientID: reqData['patientID'] })
            .getRawMany();


            // adding Reactions Number
            for (var i=0;i<allPosts.length;i++){
                allPosts[i]["images"] = await Database.getRepository(PostImages).findBy({post:{id:allPosts[i].id}})
                allPosts[i]["commentsNumber"] = await Database.getRepository(PostComment).countBy({post:{id:allPosts[i].id},deleted:false})
                allPosts[i]["reactions"] = await Database.getRepository(PostReaction)
                .createQueryBuilder('PostReaction')
                .where("PostReaction.post.id = :postID",{postID:allPosts[i].id})
                .getCount()

                // Remove Identitity if hideIdentity
                if (allPosts[i]['hideIdentity'] === 1){
                    allPosts[i]['userName'] = null
                    allPosts[i]['userProfileImage'] = null
                }
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
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["patientID","communityID","mainText",'date','hideIdentity'])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // AI Checking Section
            var AI_saftyRate,AI_saftyWord ;
            try{
                const AI_Propmt = `Rate the Next Message in the Context of a Post in Medical Community,
                Rate the Message and Give a Rate in percentage Weather the Message is Safe or it has a Problem, 
                and Decide what is the Probable Problem, 
                it might be one of (spam, scam, Nudity, Sucideal or Self-injury, Violance, Hate Speech, Illigal)
                if it is Somthing else, give a Word for the Problem, 
                your Response Should be in the Form :'Safety_Rate:{How Much the Post is Safe as Integer from 1 to 100},Status:{Safe if the Post is More than 70 safe, otherwise put a Word of the Problem}',
                The Post:'${reqData['mainText']}'`
                const AI_Response = await DefualtAIChat.sendMessage(AI_Propmt)
                const AI_Dict_Response = parse_AI_Text(AI_Response.response.text())
                AI_saftyRate = Number(AI_Dict_Response['Safety_Rate'])
                AI_saftyWord = AI_Dict_Response['Status']
                if(isNaN(AI_saftyRate)){
                    throw new Error("The Safety Rate is corrupted");
                }
            }catch(err){
                console.log("Error When Try To Reach The genAI API!!\n",err)
                AI_saftyRate = undefined
                AI_saftyWord = "AI Not Available"
            }

            // Create New Post Entity
            const newPost        = new Post()
            newPost.mainText     = reqData['mainText']
            newPost.date         = new Date(reqData['date'])
            newPost.hideIdentity = reqData['hideIdentity']
            newPost.patient      = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            newPost.community    = await Database.getRepository(Community).findOneBy({id:reqData['communityID']})
            newPost.AI_saftyRate = AI_saftyRate
            newPost.AI_saftyWord = AI_saftyWord
            
            //Enabled For Developing
            newPost.approved     = true  

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
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["patientID","postID","communityID","mainText",'editDate','hideIdentity'])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
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
        const checkParams = checkUndefined(reqData,["patientID","postID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
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
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["patientID","postID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{

            // Check if The User Reacted Already
            const reaction = await Database.getRepository(PostReaction).findOneBy({patient:{id:reqData['patientID']},post:{id:reqData['postID']}})
            if (reaction){
                return responseGenerater.sendError("You Already Reacted on this Post")

            }

            const newReaction    = new PostReaction()
            newReaction.patient  = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            newReaction.post     = await Database.getRepository(Post).findOneBy({id:reqData['postID']})
            // newReaction.reaction = reqData['reaction'].toLowerCase()

            // Check if Data Was Wrong
            if (newReaction.patient === null || newReaction.post === null){
                return responseGenerater.custom(403,"The Data you Entered is Wrong")
            }

            
            // Save The Reaction to the DB
            await Database.getRepository(PostReaction).save(newReaction)
            
            // Send a Notification for Post Writer
            const writer = await Database.getRepository(Post)
            .createQueryBuilder("Post")
            .innerJoinAndSelect("Post.patient",'patient')
            .where("Post.id = :postID",{postID:reqData['postID']})
            .getOne()
            const notifyText = newReaction.post.mainText.length > 20 ? newReaction.post.mainText.substring(0, 20) + '...' : newReaction.post.mainText;
            await NotificationFunctions.sendPatientNotification(writer.patient.id,'Interactions',"Someone Reacted on Your Post",notifyText)
        
            // Getting the Reactions Count after the User Adding Reaction
            const newCount = await Database.getRepository(PostReaction).countBy({post:{id:reqData['postID']}})
            return responseGenerater.sendData({"reactions":newCount,"likedByUser":true})
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Patient can Remove React on a Post
    async RemoveReactOnPost(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["patientID","postID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            const newReaction    = await Database.getRepository(PostReaction).findOneBy({post:{id:reqData['postID']},patient:{id:reqData['patientID']}})

            // Check if Data Was Missing
            if (newReaction === null){
                return responseGenerater.notFound
            }


            // Delete the Post Related Reactions 
            await Database.getRepository(PostReaction)
            .createQueryBuilder('PostReaction')
            .delete()
            .from(PostReaction)
            .where("post.id = :postID", { postID: reqData['postID'] })
            .andWhere("patient.id = :patientID", { patientID: reqData['patientID'] })
            .execute()

            // Getting the Reactions Count after the User Removing Reaction
            const newCount = await Database.getRepository(PostReaction).countBy({post:{id:reqData['postID']}})
            return responseGenerater.sendData({"reactions":newCount,"likedByUser":false})
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Get All Post Comments
    async GetPostComments(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["loadBlock","postID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            const commmentList = await Database.getRepository(PostComment)
            .createQueryBuilder("Comment")
            .innerJoinAndSelect("Comment.patient","patient")
            .where("Comment.deleted = false")
            .andWhere("Comment.post = :postID",{postID:reqData['postID']})
            .select([
                "Comment.id as id",
                "Comment.comment as comment",
                "Comment.date as date",
                "patient.id as patientID",
                "patient.name as patientName",
                "patient.profileImage as patientProfileImage",
            ])
            .orderBy('Comment.date', 'DESC')
            .limit(2)
            .offset(2* (Number(reqData['loadBlock'])-1))
            .getRawMany()

            // Reactions Feature 
            for (var i=0;i< commmentList.length;i++){
                commmentList[i]['reactions'] = await Database.getRepository(PostCommentsReaction)
                .createQueryBuilder('comment')
                .where("comment.id = :commentID",{commentID:commmentList[i].id})
                .getCount()
                
            }

            return responseGenerater.sendData(commmentList)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Patient Can Comment on a Post
    async AddComment(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['patientID',"postID","comment","date"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
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
            
            // Send a Notification for Post Writer
            const writer = await Database.getRepository(Post)
            .createQueryBuilder("Post")
            .innerJoinAndSelect("Post.patient",'patient')
            .where("Post.id = :postID",{postID:reqData['postID']})
            .getOne()
            const notifyText = newComment.post.mainText.length > 20 ? newComment.post.mainText.substring(0, 20) + '...' : newComment.post.mainText;
            await NotificationFunctions.sendPatientNotification(writer.patient.id,'Interactions',"Someone Added a Comment on Your Post",notifyText)


            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Patient Remove his Comment
    async RemoveComment(reqData){
        const checkParam = checkUndefined(reqData,["patientID",'commentID'])
        if(checkParam){
            return  responseGenerater.sendMissingParam(checkParam)
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
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['patientID','commentID'])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
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
            // newLike.reaction = reqData['reaction'].toLowerCase()
            newLike.comment  = await Database.getRepository(PostComment).findOneBy({id:reqData['commentID']})
            newLike.patient  = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            newLike.post     = post.post

            // Check if the Data Exist
            if (newLike.patient === null || newLike.patient=== null){
                return responseGenerater.notFound
            }
            
            // Save to DB
            await Database.getRepository(PostCommentsReaction).save(newLike)

            // Send a Notification for Comment Writer
            const writer = await Database.getRepository(PostComment)
            .createQueryBuilder("PostComment")
            .innerJoinAndSelect("PostComment.patient",'patient')
            .where("PostComment.id = :commentID",{commentID:reqData['commentID']})
            .getOne()
            const notifyText = newLike.comment.comment.length > 20 ?  newLike.comment.comment.substring(0, 20) + '...' :  newLike.comment.comment;
            await NotificationFunctions.sendPatientNotification(writer.patient.id,'Interactions',"Someone Reacted on Your Comment",notifyText)


            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Remove a Reaction from A Comment
    async RemoveCommentReaction(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['commentID',"patientID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
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
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['loadBlock',"patientID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // get and Send the List
            const postList = await Database.getRepository(SavedPost)
                .createQueryBuilder("Saved")
                .innerJoinAndSelect("Saved.post","Post")
                .innerJoinAndSelect("Post.patient","patient")
                .innerJoinAndSelect("Post.community","community")
                .andWhere("Post.approved = true")
                .andWhere("Post.deleted = false")
                .select([
                    "Post.id as id",
                    "Post.date as date",
                    "Post.views as views",
                    "Post.edited as edited",
                    "Post.mainText as mainText",
                    "Post.hideIdentity as hideIdentity",
                    "community.name as community",
                    "patient.id as patientID",
                    "patient.name as userName",
                    "patient.profileImage as userProfileImage",
                ])
                .limit(15)
                .offset(15* (Number(reqData['loadBlock'])-1))
                .getRawMany()


            // Remove Identitity if hideIdentity
            for(var i =0;i<postList.length;i++){
                if (postList[i]['hideIdentity'] === 1){
                    postList[i]['userName'] = null
                    postList[i]['userProfileImage'] = null
                }
            }
            return responseGenerater.sendData(postList)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

    // Patient Saving this Post in Saved List
    async savePostToSavedList(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['postID',"patientID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
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
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['postID',"patientID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
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


export default new CommunityFunctions();

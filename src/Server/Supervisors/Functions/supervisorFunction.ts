import { Database } from "../../../data-source";
import { Categories } from "../../Blog/Tables/Categories";
import { CategorySuggester } from "../../Blog/Tables/CategorySuggester";
import { Post } from "../../Community/Tables/Post";
import { PostComment } from "../../Community/Tables/PostComment";
import { Supervisor } from "../../User Info/Tables/Users/Supervisor";
import checkUndefined from "../../../Public Functions/checkUndefined";
import responseGenerator from "../../../Public Functions/responseGenerator";
import NotificationFunctions from "../../User Info/Functions/NotificationFunctions";
import communityFunctions from "../../Community/Functions/communityFunctions";
import { PostImages } from "../../Community/Tables/PostImages";

class SupervisorFunction{

    // Get All Un-Approved Categories
    async getAllSuggestedBlogCategories(){
        try{

            // Getting all Un Approved Categories
            const data = await Database.getRepository(Categories).findBy({approved:false})
            return responseGenerator.sendData(data)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }

    }

    // Take a Decision on the Category
    async approve_disapprove_category(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['categoryID','approve'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Get The Category Info
            const category = await Database.getRepository(Categories).findOneBy({id:reqData['categoryID'],approved:false})
            if (category === null){
                return responseGenerator.notFound
            }

            // Get The Suggested Doctor to Send in-app Notification
            const writer = await Database.getRepository(CategorySuggester)
            .createQueryBuilder("CategorySuggester")
            .innerJoinAndSelect("CategorySuggester.doctor",'doctor')
            .where("CategorySuggester.category.id = :categoryID",{categoryID:reqData['categoryID']})
            .getOne()
            
            //  Remove the Followingup Suggestion
            await Database
            .getRepository(CategorySuggester)
            .createQueryBuilder('CategorySuggester')
            .delete()
            .from(CategorySuggester)
            .where("category.id = :categoryID", { categoryID: reqData['categoryID'] })
            .execute()
            if (reqData['approve']){

                // Approve The Category and Save it
                category.approved = true
                await Database.getRepository(Categories).save(category)
            }else{

                // Remove The Category
                await Database
                .getRepository(Categories)
                .createQueryBuilder('Categories')
                .delete()
                .from(Categories)
                .where("id = :categoryID", { categoryID: reqData['categoryID'] })
                .execute()
            }
            
            const stat = reqData['approve'] ? "Approved":"Declined"
            await NotificationFunctions.sendDoctorNotification(writer.doctor.id,'System',`Your Category Request Had Been ${stat}`,category.category)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }

    }

    // Get All Un-Approved Posts
    async getAllunapprovedPosts(reqData){
        var loadBlock = 1
        if (reqData['loadBlock'] !== undefined && Number(reqData['loadBlock'])>1){
            loadBlock = reqData['loadBlock']
        }
        try{

            var data =await  Database.getRepository(Post)
            .createQueryBuilder("Post")
            .innerJoinAndSelect("Post.patient", "patient")
            .innerJoinAndSelect("Post.community", "community")
            .where("Post.approved = false")
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
            .offset(15 * (Number(loadBlock) - 1))

            ////  Filtering Posts
            // Getting a specific Community Posts
            if (reqData["communityID"] !== undefined ){
                data = data
                .andWhere("community.id = :communityID", { communityID: reqData['communityID'] })
                
            }
            // Getting Posts With a specific Text in them
            if (reqData["searchText"] !== undefined ){
                data = data
                .andWhere("Post.mainText like :searchText", { searchText: "%" + reqData['searchText'] + "%" })
            }
            var allPosts = await data.getRawMany()

            // Refactor the Json
            for(var d =0;d<allPosts.length; d++){
                allPosts[d]['images'] = await  Database.getRepository(PostImages).findBy({post:{id:allPosts[d].id}})

            }
            return responseGenerator.sendData(allPosts)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }

    }

    // Take a Decision on the Post
    async approve_disapprove_post(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['postID','approve'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Get The Post Info
            const postInfo = await Database.getRepository(Post).findOneBy({id:reqData['postID'],approved:false})
            if (postInfo === null){
                return responseGenerator.notFound
            }
            if (reqData['approve']){
                // Approve The Post and Save it
                postInfo.approved = true
                
            }else{
                // Edit the Post To Be Deleted and Save it
                postInfo.deleted = true
            }
            await Database.getRepository(Post).save(postInfo)

            // Send in-app Notification
            const writer = await Database.getRepository(Post)
            .createQueryBuilder("Post")
            .innerJoinAndSelect("Post.patient",'patient')
            .where("Post.id = :postID",{postID:reqData['postID']})
            .getOne()
            const stat = reqData['approve']? "Approved":`Disapproved (${reqData['reason']})`
            await NotificationFunctions.sendPatientNotification(writer.patient.id,"System",`Your Post Has Been ${stat}`,'')


            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }

    }

    // Remove a Post From Posts Lists (With a Message)
    async Remove_post(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['postID','reason'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // // Check Supervisor Auth
            // const supervisor = await Database.getRepository(Supervisor).findOneBy({id:reqData['superID'],passcode:reqData['passcode']})
            // if(supervisor === null){
            //     return responseGenerator.custom(405,"unAuthorized")
            // }

            // Get The Post Info
            const postInfo = await Database.getRepository(Post).findOneBy({id:reqData['postID']})
            if (postInfo === null){
                return responseGenerator.notFound
            }

            // Edit the Post To Be Deleted and Save it
            postInfo.deleted = true
            await Database.getRepository(Post).save(postInfo)

            // Send in-app Notification
            const writer = await Database.getRepository(Post)
            .createQueryBuilder("Post")
            .innerJoinAndSelect("Post.patient",'patient')
            .where("Post.id = :postID",{postID:reqData['postID']})
            .getOne()
            const notifyText = writer.mainText.length > 20 ? writer.mainText.substring(0, 20) + '...' : writer.mainText;
            await NotificationFunctions.sendPatientNotification(writer.patient.id,"System",`Your Post Had Been Deleted Due To Community Guidelines (${reqData['reason']})`,notifyText)

            return responseGenerator.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Remove a Post From Posts Lists (With a Message)
    async Remove_comment(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['commentID',"patientID",'reason'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // // Check Supervisor Auth
            // const supervisor = await Database.getRepository(Supervisor).findOneBy({id:reqData['superID'],passcode:reqData['passcode']})
            // if(supervisor === null){
            //     return responseGenerator.custom(405,"unAuthorized")
            // }
            
            // Get Comment Info 
            const comment = await Database.getRepository(PostComment)//.findOneBy({id:reqData['commentID']})
            .createQueryBuilder("PostComment")
            .innerJoinAndSelect("PostComment.patient",'patient')
            .where("PostComment.id = :commentID",{commentID:reqData['commentID']})
            .getOne()

            // // Delete The Comment
            // const rmv = await communityFunctions.RemoveComment(reqData)
            // if (rmv.status !== 200){
            //     return rmv
            // }
            comment.deleted = true
            await Database.getRepository(PostComment).save(comment)

            // Send in-app Notification
            const notifyText = comment.comment.length > 20 ? comment.comment.substring(0, 20) + '...' : comment.comment;
            await NotificationFunctions.sendPatientNotification(comment.patient.id,"System",`Your Comment Had Been Deleted Due To Community Guidelines (${reqData['reason']})`,notifyText)

            return responseGenerator.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

}
export default new SupervisorFunction();
import { Database } from "../../data-source";
import { Categories } from "../../entity/Blog/Categories";
import { CategorySuggester } from "../../entity/Blog/CategorySuggester";
import { Post } from "../../entity/community/Post";
import { PostComment } from "../../entity/community/PostComment";
import { Supervisor } from "../../entity/users/Supervisor";
import checkUndefined from "../../middleFunctions/checkUndefined";
import responseGenerator from "../../middleFunctions/responseGenerator";
import NotificationFunctions from "./NotificationFunctions";
import communityFunctions from "./communityFunctions";

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
    async getAllunapprovedPosts(){
        try{

            // Getting all Un Approved Categories
            const data = await Database.getRepository(Post).findBy({approved:false})
            return responseGenerator.sendData(data)

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
            if (reqData['approve']){

                // Get The Post Info
                const category = await Database.getRepository(Post).findOneBy({id:reqData['postID'],approved:false})
                if (category === null){
                    return responseGenerator.notFound
                }

                // Approve The Post and Save it
                category.approved = true
                await Database.getRepository(Post).save(category)
                
            }else{

                // Remove The Post
                await Database
                .getRepository(Post)
                .createQueryBuilder('Post')
                .delete()
                .from(Post)
                .where("id = :postID", { postID: reqData['postID'] })
                .execute()
            }

            // Send in-app Notification
            const writer = await Database.getRepository(Post)
            .createQueryBuilder("Post")
            .innerJoinAndSelect("Post.patient",'patient')
            .where("Post.id = :postID",{postID:reqData['postID']})
            .getOne()
            const stat = reqData['approve']? "Approved":"Disapproved"
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
        const checkParam = checkUndefined(reqData,['postID','superID','passcode'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Check Supervisor Auth
            const supervisor = await Database.getRepository(Supervisor).findOneBy({id:reqData['superID'],passcode:reqData['passcode']})
            if(supervisor === null){
                return responseGenerator.custom(405,"unAuthorized")
            }

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
            await NotificationFunctions.sendPatientNotification(writer.patient.id,"System","Your Post Had Been Deleted Due To Community Guidelines",notifyText)

            return responseGenerator.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Remove a Post From Posts Lists (With a Message)
    async Remove_comment(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['commentID',"patientID",'superID','passcode'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Check Supervisor Auth
            const supervisor = await Database.getRepository(Supervisor).findOneBy({id:reqData['superID'],passcode:reqData['passcode']})
            if(supervisor === null){
                return responseGenerator.custom(405,"unAuthorized")
            }
            
            // Get Comment Info 
            const comment = await Database.getRepository(PostComment)
            .createQueryBuilder("PostComment")
            .innerJoinAndSelect("PostComment.patient",'patient')
            .where("PostComment.commentID = :commentID",{postID:reqData['commentID']})
            .getOne()

            // Delete The Comment
            const rmv = await communityFunctions.RemoveComment(reqData)
            if (rmv.status !== 200){
                return rmv
            }

            // Send in-app Notification
            const notifyText = comment.comment.length > 20 ? comment.comment.substring(0, 20) + '...' : comment.comment;
            await NotificationFunctions.sendPatientNotification(comment.patient.id,"System","Your Comment Had Been Deleted Due To Community Guidelines",notifyText)

            return responseGenerator.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

}
export default new SupervisorFunction();
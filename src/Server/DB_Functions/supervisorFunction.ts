import { Database } from "../../data-source";
import { Categories } from "../../entity/Blog/Categories";
import { Post } from "../../entity/community/Post";
import { PostComment } from "../../entity/community/PostComment";
import { Supervisor } from "../../entity/users/Supervisor";
import checkUndefined from "../../middleFunctions/checkUndefined";
import responseGenerator from "../../middleFunctions/responseGenerator";
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
            if (reqData['approve'] == true){

                // Get The Category Info
                const category = await Database.getRepository(Categories).findOneBy({id:reqData['categoryID'],approved:false})
                if (category === null){
                    return responseGenerator.notFound
                }

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
            if (reqData['approve'] == true){

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
            
            // Delete The Comment
            const rmv = await communityFunctions.RemoveComment(reqData)
            if (rmv.status !== 200){
                return rmv
            }

            // Send a Notification

            return responseGenerator.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

}
export default new SupervisorFunction();
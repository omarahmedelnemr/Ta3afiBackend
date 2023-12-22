import { Database } from "../../../data-source";
import { Article } from "../../Blog/Tables/Article";
import { ChatPlans } from "../../Chat/Tables/ChatPlans";
import { Community } from "../../Community/Tables/Community";
import { Post } from "../../Community/Tables/Post";
import { PostReaction } from "../../Community/Tables/PostReaction";
import { LoginRouter } from "../../Login/Tables/LoginRouter";
import { Supervisor } from "../../User Info/Tables/Users/Supervisor";
import checkUndefined from "../../../Public Functions/checkUndefined";
import responseGenerater from "../../../Public Functions/responseGenerator";

var jwt = require('jsonwebtoken');

class AdminFunctions{

    // Login Function For Admins
    async adminLogin(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['email',"password"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }

        // Read the Parameters
        const email    = reqData['email']
        const password = reqData['password']
        try{
            if (email !== process.env.ADMIN_EMAIL){
                return responseGenerater.sendError("Wrong Email or Password")
            }
            else if(password !== process.env.ADMIN_PASSWORD){
                return responseGenerater.sendError("Wrong Email or Password")
            }
            else{
                const JWTInfo = {
                    "email":email
                }
                //Generat JWT That Last For 2 Days, But Check Supervision Auth
                var genratedJWT = jwt.sign( JWTInfo,process.env.ADMIN_SECRET,{ expiresIn: 60 * 60 *24*2 });
                return responseGenerater.sendData({'token':genratedJWT})
    
            }
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Get General Data Like Doctors Number, Patients number, Posts Number, interaction and Reactions Number, articale NUmber ad More
    async getGeneralData(reqData){
        try{
            // Getting Doctors Number
            const doctorsNum = await Database.getRepository(LoginRouter).countBy({role:"doctor",active:true,confirmed:true})

            // Getting Patient Number
            const patientNum = await Database.getRepository(LoginRouter).countBy({role:"patient",active:true,confirmed:true})

            // Posts Number
            const postsCount = await Database.getRepository(Post).countBy({approved:true,deleted:false})

            // Articles Number
            const articlesCount = await Database.getRepository(Article).countBy({})

            // Reactions Count
            const postReactionCount = await Database.getRepository(PostReaction).countBy({})

            const allData = {
                doctors:doctorsNum,
                patients:patientNum,
                posts:postsCount,
                articles:articlesCount,
                reactions:postReactionCount
            }

            return responseGenerater.sendData(allData)


        }catch(err){
            console.log("Erro!!\n",err)
            return responseGenerater.Error
        }
    }

    // Get All Supervisors List
    async GetAllSupervisors(reqData){
        try{
            // Getting all The List
            const SupervisersList = await Database.getRepository(Supervisor).findBy({})
            return responseGenerater.sendData(SupervisersList)
        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerater.Error
        }
    }

    // get Posts activity over Time
    async getPostsActivityOverTime(reqData) {
        try {
    
            // Group by month and count posts
            const postsActivity = await Database.getRepository(Post).createQueryBuilder("post")
                .select("DATE_FORMAT(post.date, '%Y-%m') AS month")
                .addSelect("COUNT(post.id) AS postCount")
                .groupBy("month")
                .getRawMany();
    
            // // Convert the result to a dictionary
            // const postsActivityDictionary = postsActivity.reduce((acc, entry) => {
            //     acc[entry.month] = entry.postCount;
            //     return acc;
            // }, {});
    
            return responseGenerater.sendData(postsActivity);
        } catch (err) {
            console.log("Error!!\n", err);
            return responseGenerater.Error;
        }
    }

    // Get Article activity over Time
    async getArticleActivityOverTime(reqData) {
        try {
            // Group by month and count Articles
            const articlesActivity = await Database.getRepository(Article).createQueryBuilder("Article")
            .select("DATE_FORMAT(Article.date, '%Y-%m') AS month")
            .addSelect("COUNT(Article.id) AS articleCount")
            .groupBy("month")
            .getRawMany();

            return responseGenerater.sendData(articlesActivity);
        } catch (err) {
            console.log("Error!!\n", err);
            return responseGenerater.Error;
        }
    }

    // Create a Signup Link For Supervisors
    async createSupervisorSignupLink(reqData) {
        try {
            // Your logic to create a signup link for supervisors
            // ...

            // return responseGenerater.sendData(signupLink);
        } catch (err) {
            console.log("Error!!\n", err);
            return responseGenerater.Error;
        }
    }

    // Add New Supervisor (Supervisor Signup)
    async addNewSupervisor(reqData) {
        try {
            // Your logic to add a new supervisor
            // ...

            // return responseGenerater.sendData(newSupervisorData);
        } catch (err) {
            console.log("Error!!\n", err);
            return responseGenerater.Error;
        }
    }

    // Remove a Supervisor
    async removeSupervisor(supervisorId) {
        try {
            // Your logic to remove a supervisor
            // ...

            return responseGenerater.sendData({ message: "Supervisor removed successfully" });
        } catch (err) {
            console.log("Error!!\n", err);
            return responseGenerater.Error;
        }
    }

    // Add New Community
    async addNewCommunity(reqData){
        // Check Parameter Existence
        const checkParam  = checkUndefined(reqData,['name','description',"iconLink"])
        if (checkParam){
            responseGenerater.sendMissingParam(checkParam)
        }
        try{
            //  Create New Community
            const NewCommunity        = new Community()
            NewCommunity.name         = reqData['name'] 
            NewCommunity.description  = reqData['description'] 
            NewCommunity.iconLink  = reqData['iconLink'] 
            NewCommunity.approved     = true
            await Database.getRepository(Community).save(NewCommunity)
            
            return responseGenerater.done
        } catch (err) {
            console.log("Error!!\n", err);
            return responseGenerater.Error;
        }

    }

    // Add New Chat Plan
    async addNewChatPlan(reqData){
        // Check Parameter Existence
        const checkParam  = checkUndefined(reqData,['price','currency',"amount"])
        if (checkParam){
            responseGenerater.sendMissingParam(checkParam)
        }
        try{
            //  Create New Chat Plan
            const NewChatPlan      = new ChatPlans()
            NewChatPlan.price      = reqData['price'] 
            NewChatPlan.currency   = reqData['currency'] 
            NewChatPlan.amount     = reqData['amount']
            await Database.getRepository(ChatPlans).save(NewChatPlan)
            
            return responseGenerater.done
        } catch (err) {
            console.log("Error!!\n", err);
            return responseGenerater.Error;
        }
    }
}

export default new AdminFunctions();

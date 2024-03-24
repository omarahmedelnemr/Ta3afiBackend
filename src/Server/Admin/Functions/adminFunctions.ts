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
import NotificationFunctions from "../../User Info/Functions/NotificationFunctions";
import { PostComment } from "../../Community/Tables/PostComment";
import communityFunctions from "../../Community/Functions/communityFunctions";
import { Appointment } from "../../Appointments/Tables/Appointment";
import findMissingMonths from "../../../Public Functions/MonthsCounting";

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
    // async getGeneralData(reqData){
    //     try{
            

    //         // Getting Patient Number
    //         const patientNum = await Database.getRepository(LoginRouter).countBy({role:"patient",active:true,confirmed:true})

            

            

    //         // Reactions Count
    //         const postReactionCount = await Database.getRepository(PostReaction).countBy({})

    //         const allData = {
    //             doctors:doctorsNum,
    //             patients:patientNum,
    //             posts:postsCount,
    //             articles:articlesCount,
    //             reactions:postReactionCount
    //         }

    //         return responseGenerater.sendData(allData)


    //     }catch(err){
    //         console.log("Erro!!\n",err)
    //         return responseGenerater.Error
    //     }
    // }

    // Getting Patients Number
    async getPatientsNumber(reqData){
        try{
            // Getting patients Number
            const patientsNum = await Database.getRepository(LoginRouter).countBy({role:"patient",active:true,confirmed:true})
            return responseGenerater.sendData({"number":patientsNum})
        }catch(err){
            console.log("Erro!!\n",err)
            return responseGenerater.Error
        }
    }

    // Getting Doctors Number
    async getDoctorsNumber(reqData){
        try{

            // Getting Doctors Number
            const doctorsNum = await Database.getRepository(LoginRouter).countBy({role:"doctor",active:true,confirmed:true})
            return responseGenerater.sendData({"number":doctorsNum})

        }catch(err){
            console.log("Erro!!\n",err)
            return responseGenerater.Error
        }
    }

    // Getting articles Number
    async getarticlesNumber(reqData){
        try{
            // Articles Number
            const articlesCount = await Database.getRepository(Article).countBy({})
            return responseGenerater.sendData({'number':articlesCount})

        }catch(err){
            console.log("Erro!!\n",err)
            return responseGenerater.Error
        }
    }

    // Getting Posts Number
    async getPostsNumber(reqData){
        try{
            // Posts Number
            const postsCount = await Database.getRepository(Post).countBy({approved:true,deleted:false})
            return responseGenerater.sendData({'number':postsCount})

        }catch(err){
            console.log("Erro!!\n",err)
            return responseGenerater.Error
        }
    }

    // Get Appointments Number With Statuses
    async getAppointmentStatus(reqData){
        try{
            
            const completedApp = await Database.getRepository(Appointment).countBy({status:"completed"})
            const canceledApp = await Database.getRepository(Appointment).countBy({status:"canceled"})
            const scheduledApp = await Database.getRepository(Appointment).countBy({status:"scheduled"})

            return responseGenerater.sendData({'scheduled':scheduledApp,'completed':completedApp,"canceled":canceledApp})

        }catch(err){
            console.log("Erro!!\n",err)
            return responseGenerater.Error
        }
    }

    // Get All Posts Count Over a Given Period of Time
    async getPostsOvertime(reqData){
        try{
            var fromDate = new Date(reqData['fromDate'])
            var toDate = new Date(reqData['toDate'])
        
            var result = await Database
                .getRepository(Post)
                .createQueryBuilder('post')
                .select('YEAR(post.date)', 'year')
                .addSelect("DATE_FORMAT(post.date, '%M')", 'month')
                .addSelect('COUNT(*)', 'postCount')
                .where('post.date BETWEEN :fromDate AND :toDate', { fromDate, toDate })
                .groupBy('year, month')
                .orderBy('year, month')
                .getRawMany();

            result =  result.map(row => ({
                year: row.year,
                month: row.month,
                count: parseInt(row.postCount) // Assuming postCount is returned as string
            }));
            
            return responseGenerater.sendData(findMissingMonths(result,fromDate,toDate))


        }catch(err){
            console.log("Erro!!\n",err)
            return responseGenerater.Error
        }
    }

    // Get All Articles Count Over a Given Period of Time
    async getArticlesOvertime(reqData){
        try{
            var fromDate = new Date(reqData['fromDate'])
            var toDate = new Date(reqData['toDate'])
        
            var result = await Database
                .getRepository(Article)
                .createQueryBuilder('article')
                .select('YEAR(article.date)', 'year')
                .addSelect("DATE_FORMAT(article.date, '%M')", 'month')
                .addSelect('COUNT(*)', 'articleCount')
                .where('article.date BETWEEN :fromDate AND :toDate', { fromDate, toDate })
                .groupBy('year, month')
                .orderBy('year, month')
                .getRawMany();

            result =  result.map(row => ({
                year: row.year,
                month: row.month,
                count: parseInt(row.articleCount) // Assuming postCount is returned as string
            }));
            
            return responseGenerater.sendData(findMissingMonths(result,fromDate,toDate))


        }catch(err){
            console.log("Erro!!\n",err)
            return responseGenerater.Error
        }
    }

    // Get All Appointments Count Over a Given Period of Time
    async getAppointmentsOvertime(reqData){
        try{
            var fromDate = new Date(reqData['fromDate'])
            var toDate = new Date(reqData['toDate'])
        
            var result = await Database
                .getRepository(Appointment)
                .createQueryBuilder('appointment')
                .select('YEAR(appointment.date)', 'year')
                .addSelect("DATE_FORMAT(appointment.date, '%M')", 'month')
                .addSelect('COUNT(*)', 'appointmentCount')
                .where('appointment.date BETWEEN :fromDate AND :toDate', { fromDate, toDate })
                .groupBy('year, month')
                .orderBy('year, month')
                .getRawMany();

            result =  result.map(row => ({
                year: row.year,
                month: row.month,
                count: parseInt(row.appointmentCount) // Assuming postCount is returned as string
            }));
            
            return responseGenerater.sendData(findMissingMonths(result,fromDate,toDate))


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
            var superInfo;
            for (var i=0;i<SupervisersList.length;i++){
                superInfo = await Database.getRepository(LoginRouter).findOneBy({role:"supervisor",userID:SupervisersList[i].id})
                SupervisersList[i]['email'] = superInfo.email
                SupervisersList[i]['active'] = superInfo.active
            }
            return responseGenerater.sendData(SupervisersList)
        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerater.Error
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

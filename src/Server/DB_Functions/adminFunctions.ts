import { Database } from "../../data-source";
import { Article } from "../../entity/Blog/Article";
import { ArticleComment } from "../../entity/Blog/ArticleComment";
import { ArticleCommentsLike } from "../../entity/Blog/ArticleCommentLikes";
import { ArticleDoctorVotes } from "../../entity/Blog/ArticleDoctorVotes";
import { ArticleImages } from "../../entity/Blog/ArticleImages";
import { ArticleSeen } from "../../entity/Blog/ArticleSeen";
import { ArticleVotes } from "../../entity/Blog/ArticleVotes";
import { Categories } from "../../entity/Blog/Categories";
import { CategorySuggester } from "../../entity/Blog/CategorySuggester";
import { SavedArticle } from "../../entity/Blog/SavedArticle";
import { Post } from "../../entity/community/Post";
import { PostReaction } from "../../entity/community/PostReaction";
import { LoginRouter } from "../../entity/login/LoginRouter";
import { Doctor } from "../../entity/users/Doctor";
import { Patient } from "../../entity/users/Patient";
import { Supervisor } from "../../entity/users/Supervisor";
import checkUndefined from "../../middleFunctions/checkUndefined";
import responseGenerater from "../../middleFunctions/responseGenerator";
import NotificationFunctions from "./NotificationFunctions";


class AdminFunctions{

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

    // get Articale activity over Time

    // get Number of Active Users over Time

    // Add New Supervisor

    // remove a Supervisor

}

export default new AdminFunctions();

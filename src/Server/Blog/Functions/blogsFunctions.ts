import { Database } from "../../../data-source";
import { Article } from "../Tables/Article";
import { ArticleComment } from "../Tables/ArticleComment";
import { ArticleCommentsLike } from "../Tables/ArticleCommentLikes";
import { ArticleDoctorVotes } from "../Tables/ArticleDoctorVotes";
import { ArticleImages } from "../Tables/ArticleImages";
import { ArticleSeen } from "../Tables/ArticleSeen";
import { ArticleVotes } from "../Tables/ArticleVotes";
import { Categories } from "../Tables/Categories";
import { CategorySuggester } from "../Tables/CategorySuggester";
import { SavedArticle } from "../Tables/SavedArticle";
import { Doctor } from "../../User Info/Tables/Users/Doctor";
import { Patient } from "../../User Info/Tables/Users/Patient";
import checkUndefined from "../../../Public Functions/checkUndefined";
import responseGenerater from "../../../Public Functions/responseGenerator";
import NotificationFunctions from "../../User Info/Functions/NotificationFunctions";
import { DefualtAIChat } from "../../../Middleware/GenAI";
import parse_AI_Text from "../../../Middleware/ParseAIText";


class BlogFunctions{

    //-------------------------------------------------------------------------------------------
    //--------------------------------- General Post Viewing ------------------------------------
    //-------------------------------------------------------------------------------------------
    async getCommonQueryBuilder  (loadBlock){
        return await Database.getRepository(Article)
        .createQueryBuilder("article")
        .innerJoinAndSelect("article.doctor","doctor")
        .innerJoinAndSelect("article.category","category")
        .select([
            "article.id as id",
            "article.title as title",
            "article.covorImage as covorImage",
            "article.date as date",
            "article.edited as edited",
            "SUBSTRING(article.mainText, 1, 100) as mainText",
            "article.AI_saftyRate as AI_saftyRate",
            "article.AI_saftyWord as AI_saftyWord",
            "article.views as views",
            "category.category as category",
            "doctor.name as doctorName",
            "doctor.title as doctorTitle",
            "doctor.profileImage as doctorProfileImage",
            "doctor.starRate as doctorStarRate",
            "doctor.completedSessions as doctorSessionNumber"
        ])
        .orderBy('article.date', 'DESC')
        .limit(15)
        .offset(15* (Number(loadBlock)-1))
    };

    //-------------------------------------------------------------------------------------------
    //-------------------------------------- General --------------------------------------------
    //-------------------------------------------------------------------------------------------
    
    // Get All Approved Categories List
    async GetCategoriesList(reqData){
        try{
            // Get All The List of Categories
            const CategoryList = await  Database.getRepository(Categories).findBy({approved:true})
            return responseGenerater.sendData(CategoryList)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Get all Articles With a Category or Not
    async GetAllArticleList(reqData){
        // Check Parameter Existence
        const checkParam  = checkUndefined(reqData,['loadBlock'])
        if (checkParam){
            return responseGenerater.sendMissingParam(checkParam)
        }
        try{
            var allArticles;
            var baseQuery = await this.getCommonQueryBuilder(reqData['loadBlock']);

            if (reqData["categoryID"] !== undefined ){
                baseQuery = baseQuery
                .andWhere("category.id = :categoryID", { categoryID: reqData['categoryID'] })
                
            }
            // Getting Article With a specific Text in them
            if (reqData["searchText"] !== undefined ){
                baseQuery = baseQuery
                .andWhere("article.mainText like :searchText", { searchText: "%" + reqData['searchText'] + "%" })
            }

            allArticles = await baseQuery.getRawMany()


            // adding Seen and upvotesNumbers
            for (var i=0;i<allArticles.length;i++){
                allArticles[i]["seenCount"] = await Database.getRepository(ArticleSeen).countBy({article:{id:allArticles[i].id}})
                allArticles[i]["commentsNumber"] = await Database.getRepository(ArticleComment).countBy({article:{id:allArticles[i].id}})
                allArticles[i]["upVotes"] = await Database.getRepository(ArticleVotes).countBy({article:{id:allArticles[i].id}})
                
            }
            return responseGenerater.sendData(allArticles)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Get all Articles With a Category or Not
    async GetAdminAllArticleList(reqData){
        // Check Parameter Existence
        const checkParam  = checkUndefined(reqData,['loadBlock'])
        if (checkParam){
            return responseGenerater.sendMissingParam(checkParam)
        }
        try{
            var allArticles;
            var baseQuery = await this.getCommonQueryBuilder(reqData['loadBlock']);

            if (reqData["categoryID"] !== undefined ){
                baseQuery = baseQuery
                .andWhere("category.id = :categoryID", { categoryID: reqData['categoryID'] })
                
            }
            // Getting Article With a specific Text in them
            if (reqData["searchText"] !== undefined ){
                baseQuery = baseQuery
                .andWhere("article.mainText like :searchText", { searchText: "%" + reqData['searchText'] + "%" })
            }

            allArticles = await baseQuery.getRawMany()


            // adding Seen and upvotesNumbers
            for (var i=0;i<allArticles.length;i++){
                allArticles[i]["seenCount"] = await Database.getRepository(ArticleSeen).countBy({article:{id:allArticles[i].id}})
                allArticles[i]["commentsNumber"] = await Database.getRepository(ArticleComment).countBy({article:{id:allArticles[i].id}})
                allArticles[i]["upVotes"] = await Database.getRepository(ArticleVotes).countBy({article:{id:allArticles[i].id}})
                allArticles[i]["images"] = await Database.getRepository(ArticleImages).findBy({article:{id:allArticles[i].id}})
                
            }
            return responseGenerater.sendData(allArticles)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Search for an Article By Name
    async SearchForArticleByTitle(reqData){
        // Check Parameter Existence
        const checkParam  = checkUndefined(reqData,['searchTitle',"loadBlock"])
        if (checkParam){
            return responseGenerater.sendMissingParam(checkParam)
        }
        try{
            const allArticles = await Database.getRepository(Article)
            .createQueryBuilder("article")
            .innerJoinAndSelect("article.doctor","doctor")
            .innerJoinAndSelect("article.category","category")
            .where("article.title like :searchTitle" ,{searchTitle:"%"+reqData['searchTitle']+"%"})
            .select([
                "article.id as id",
                "article.title as title",
                "article.covorImage as covorImage",
                "article.date as date",
                "article.views as views",
                "category.category as category",
                "doctor.name as doctorName",
                "doctor.title as doctorTitle",
                "doctor.profileImage as doctorProfileImage",
                "doctor.starRate as doctorStarRate",
                "doctor.completedSessions as doctorSessionNumber"
            ])
            .orderBy('article.date', 'DESC')
            .limit(15)
            .offset(15* (Number(reqData['loadBlock'])-1))
            .getRawMany()

            return responseGenerater.sendData(allArticles)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

    // View a Single Article
    async ViewAnArticle(reqData){
        // Check Parameter Existence
        const checkParam  = checkUndefined(reqData,['articleID'])
        if (checkParam){
            return responseGenerater.sendMissingParam(checkParam)
        }
        try{

            // Get the Article Info
            const articleInfo = await Database.getRepository(Article)
            .createQueryBuilder("article")
            .innerJoinAndSelect("article.doctor",'doctor')
            .innerJoinAndSelect("article.category",'category')
            .where("article.id = :articleID",{articleID:reqData['articleID']})
            .select([
                "article.id as id",
                "article.title as title",
                "article.covorImage as covorImage",
                "article.mainText as mainText",
                "article.edited as edited",
                "article.date as date",
                "article.views as views",
                "category.category as category",
                "doctor.name as doctorName",
                "doctor.title as doctorTitle",
                "doctor.profileImage as doctorProfileImage",
                "doctor.starRate as doctorStarRate",
                "doctor.completedSessions as doctorSessionNumber"
            ])
            .getRawOne()

            // // Adding View Count
            // articleInfo.views +=1
            // await Database.getRepository(Article).save(articleInfo)

            // Check if The Article Not Found
            if(articleInfo === null){
                return responseGenerater.notFound
            }

            // adding the Attachment Images
            articleInfo['images'] = await Database.getRepository(ArticleImages).findBy({article:{id:articleInfo.id}}) 

            // Adding the Up-Thumbs Votes and seen Count
            articleInfo['upVotes'] = await Database.getRepository(ArticleVotes).countBy({article:{id:articleInfo.id}}) 
            articleInfo['DoctorUpVotes'] = await Database.getRepository(ArticleDoctorVotes).countBy({article:{id:articleInfo.id}}) 
            articleInfo['seen'] = await Database.getRepository(ArticleSeen).countBy({article:{id:articleInfo.id}}) 
            articleInfo['commentsNumber'] = await Database.getRepository(ArticleComment).countBy({article:{id:articleInfo.id}}) 

            // Mark it as Seen
            if (reqData["patientID"] !== undefined){
                await this.PatientMarkAsSeen({patientID:reqData["patientID"],articleID:reqData["articleID"]})
            }

            return responseGenerater.sendData(articleInfo)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Get All Article Comments
    async GetArticleComments(reqData){
        const checkParam = checkUndefined(reqData,['articleID',"loadBlock"]);
        if(checkParam){
            return  responseGenerater.missingParam;
        }
        try{
            const commmentList = await Database.getRepository(ArticleComment)
            .createQueryBuilder("Comment")
            .innerJoinAndSelect("Comment.doctor","doctor")
            .where("Comment.article = :articleID",{articleID:reqData['articleID']})
            .select([
                "Comment.id as id",
                "Comment.comment as comment",
                "Comment.date as date",
                "doctor.id as doctorID",
                "doctor.name as doctorName",
                "doctor.title as doctorTitle",
                "doctor.profileImage as doctorProfileImage",
                "doctor.starRate as doctorStarRate",
                "doctor.completedSessions as doctorSessionNumber"
            ])
            .orderBy('Comment.date', 'DESC')
            .limit(15)
            .offset(15* (Number(reqData['loadBlock'])-1))
            .getRawMany()

            for (var i=0;i< commmentList.length;i++){
                commmentList[i]['likes'] = await Database.getRepository(ArticleCommentsLike).countBy({comment:{id:commmentList[i].id}})
                commmentList[i]['whoLiked'] = await Database.getRepository(ArticleCommentsLike)
                .createQueryBuilder("like")
                .innerJoinAndSelect("like.doctor","doctor")
                .where('like.comment = :commentID',{commentID:commmentList[i].id})
                .select([
                    "doctor.id as id",
                    "doctor.name as name",
                    "doctor.title as title",
                    "doctor.profileImage as profileImage",
                    "doctor.gender as gender",
                    "doctor.starRate as starRate",
                    "doctor.completedSessions as sessionsNumber"
                ])
                .getRawMany()
            }

            return responseGenerater.sendData(commmentList)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }


    //-------------------------------------------------------------------------------------------
    //------------------------------- Doctor Article Handling -----------------------------------
    //-------------------------------------------------------------------------------------------

    // Make a Doctor Suggest New Category for Blog Articls
    async RequestNewCategory(reqData){
        // Check Parameter Existence
        const checkParams =checkUndefined(reqData,['doctorID','categoryName','description'])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Create New Not Approved Category that is Waiting to Be Approved
            const newCategory       = new Categories()
            newCategory.category    = reqData['categoryName']
            newCategory.description = reqData['description']

            // Save it to DB
            await Database.getRepository(Categories).save(newCategory)

            // Create a Category Suggestion for Follow-up
            const suggest = new CategorySuggester()
            suggest.category = newCategory
            suggest.doctor   = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            await Database.getRepository(CategorySuggester).save(suggest)

            return responseGenerater.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }
 
    // Get all Articles Related to a Doctor
    async GetDoctorArticleList(reqData){
        // Check Parameter Existence
        const checkParams =checkUndefined(reqData,['doctorID',"loadBlock"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // get and Send the List
            const articleList = await Database.getRepository(Article)
            .createQueryBuilder("article")
            .innerJoinAndSelect("article.doctor","doctor")
            .innerJoinAndSelect("article.category","category")
            .where("doctor.id = :doctorID" ,{doctorID:reqData['doctorID']})
            .select([
                "article.id as id",
                "article.title as title",
                "article.covorImage as covorImage",
                "article.date as date",
                "article.views as views",
                "category.category as category",
                "doctor.name as doctorName",
                "doctor.title as doctorTitle",
                "doctor.profileImage as doctorProfileImage",
                "doctor.starRate as doctorStarRate",
                "doctor.completedSessions as doctorSessionNumber"
            ])
            .orderBy('article.date', 'DESC')
            .limit(15)
            .offset(15* (Number(reqData['loadBlock'])-1))
            .getRawMany()

            // Adding the Up-Thumbs Votes and seen Count
            for(var i= 0;i<articleList.length;i++){
                articleList[i]['upVotes'] = await Database.getRepository(ArticleVotes).countBy({article:{id:articleList[i].id}}) 
                articleList[i]['seenCount'] = await Database.getRepository(ArticleSeen).countBy({article:{id:articleList[i].id}}) 
            }

            return responseGenerater.sendData(articleList)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Make a Doctor Post New Article
    async postNewArticle(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['doctorID','coverImage','title','mainText','date','categoryID'])
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
                The Post:'title: ${reqData['title']}, text: ${reqData['mainText']}'`
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

            // Create New Article
            const newArticle      = new Article()
            newArticle.date       = new Date(reqData['date'])
            newArticle.title      = reqData['title']
            newArticle.covorImage = reqData['coverImage']
            newArticle.mainText   = reqData["mainText"]
            newArticle.doctor     = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            newArticle.category   = await Database.getRepository(Categories).findOneBy({id:reqData['categoryID']})
            newArticle.AI_saftyRate = AI_saftyRate
            newArticle.AI_saftyWord = AI_saftyWord

            // check if The Data was Missing
            if(newArticle.doctor === null || newArticle.category === null){
                return responseGenerater.custom(403,"The Data you Entered is Wrong")
            }

            // Save The Aricle To DB
            await Database.getRepository(Article).save(newArticle)

            // Saveing Article Images
            if (reqData['attachedImage'] !== undefined){
                for(var image of reqData['attachedImage']){
                    var newImage = new ArticleImages()
                    newImage.article = newArticle
                    newImage.name    = image['name']
                    newImage.link    = image['link']
                    await Database.getRepository(ArticleImages).save(newImage)
                }
            }

            

            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Make a Doctor Edit His Posted Article
    async EditArticle(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['articleID','covorImage','doctorID','title','mainText','date','categoryID'])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // get The Article info If Exist
            const article = await Database.getRepository(Article).findOneBy({id:reqData['articleID'],doctor:{id:reqData['doctorID']}})
            if(article === null){
                return responseGenerater.notFound
            }

            // Edit the Article Info
            article.category = await Database.getRepository(Categories).findOneBy({id:reqData['categoryID']})
            article.covorImage = reqData['covorImage']
            article.date       = reqData['date']
            article.title      = reqData['title']
            article.mainText   = reqData['mainText']
            article.edited     = true
            
            // Save Changes To Database
            await Database.getRepository(Article).save(article)

            /// Delete and Reset The Article Images For Editing
            // Delete the Article Images
            await Database.getRepository(ArticleImages)
            .createQueryBuilder('ArticleImages')
            .delete()
            .from(ArticleImages)
            .where("article.id = :articleID", { articleID: reqData['articleID'] })
            .execute()

            // Saveing Article Images
            if (reqData['attachedImage'] !== undefined){
                for(var image of reqData['attachedImage']){
                    var newImage = new ArticleImages()
                    newImage.article = article
                    newImage.name    = image['name']
                    newImage.link    = image['link']
                    await Database.getRepository(ArticleImages).save(newImage)
                }
            }
            return responseGenerater.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Make a Doctor Remove his Posted Article
    async DeleteArticle(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['articleID','doctorID'])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Check If Article Exist
            const article = await Database.getRepository(Article).findOneBy({id:reqData['articleID'],doctor:{id:reqData['doctorID']}})
            if(article === null){
                return responseGenerater.notFound
            }
            
            //// Delete Related Data

            // Delete the Article Comments Likes
            await Database.getRepository(ArticleCommentsLike)
            .createQueryBuilder('ArticlArticleCommentsLikee')
            .delete()
            .from(ArticleCommentsLike)
            .where("article.id = :articleID", { articleID: reqData['articleID'] })
            .execute()

            // Delete the Article Comments
            await Database.getRepository(ArticleComment)
            .createQueryBuilder('ArticleComment')
            .delete()
            .from(ArticleComment)
            .where("article.id = :articleID", { articleID: reqData['articleID'] })
            .execute()

            // Delete the Article in all Saved Lists
            await Database.getRepository(SavedArticle)
            .createQueryBuilder('SavedArticle')
            .delete()
            .from(SavedArticle)
            .where("article.id = :articleID", { articleID: reqData['articleID'] })
            .execute()

            // Delete the Article Images
            await Database.getRepository(ArticleImages)
            .createQueryBuilder('ArticleImages')
            .delete()
            .from(ArticleImages)
            .where("article.id = :articleID", { articleID: reqData['articleID'] })
            .execute()

            // Delete the Article upVotes
            await Database.getRepository(ArticleVotes)
            .createQueryBuilder('ArticleVotes')
            .delete()
            .from(ArticleVotes)
            .where("article.id = :articleID", { articleID: reqData['articleID'] })
            .execute()

            // Delete the Article Doctors upVotes
            await Database.getRepository(ArticleDoctorVotes)
            .createQueryBuilder('ArticleDoctorVotes')
            .delete()
            .from(ArticleDoctorVotes)
            .where("article.id = :articleID", { articleID: reqData['articleID'] })
            .execute()

            // Delete the Article Seen Records
            await Database.getRepository(ArticleSeen)
            .createQueryBuilder('ArticleSeen')
            .delete()
            .from(ArticleSeen)
            .where("article.id = :articleID", { articleID: reqData['articleID'] })
            .execute()

            // Delete the Article
            await Database.getRepository(Article)
            .createQueryBuilder('Article')
            .delete()
            .from(Article)
            .where("id = :articleID", { articleID: reqData['articleID'] })
            .andWhere("doctor.id = :doctorID",{ doctorID: reqData['doctorID']})
            .execute()

            return responseGenerater.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    //-------------------------------------------------------------------------------------------
    //----------------------------------- Article Ranks -----------------------------------------
    //-------------------------------------------------------------------------------------------


    // Doctors can Upvote for an Article
    async DoctorUpVote(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["doctorID","articleID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // get Article Info
            const art = await Database.getRepository(Article)
            .createQueryBuilder("doctorArt")
            .innerJoinAndSelect("doctorArt.doctor",'doctor')
            .where("doctorArt.id = :articleID",{articleID:reqData['articleID']})
            .getOne()

            if (art === null){
                return responseGenerater.notFound
            }
            // Check if the Doctor Vote for Himself
            else if (art.doctor.id === reqData['doctorID']){
                return responseGenerater.custom(403,"You Can't Vote for Yourself")
            }
            
            // check if Doctor already Voted
            const vote = await Database.getRepository(ArticleDoctorVotes).findOneBy({article:{id:reqData['articleID']},doctor:{id:reqData['doctorID']}})
            if(vote !== null){
                return responseGenerater.custom(403,"You Can Only Vote Once")
            }

            // Createing new Vote
            const newUpvote = new ArticleDoctorVotes()
            newUpvote.article = art
            newUpvote.doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})

            // Check if the Doctor Exist
            if (newUpvote.doctor === null){
                return responseGenerater.notFound
            }

            // Save it to the DB
            await Database.getRepository(ArticleDoctorVotes).save(newUpvote)
            

            // Send a Notification To The Article Writer
            const notifyText = art.title.length > 20 ? art.title.substring(0, 20) + '...' : art.title;
            await NotificationFunctions.sendDoctorNotification(art.doctor.id,'Interactions','a Doctor Voted For Your Article',notifyText)

            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Remove Doctor Up Vote
    async RemoveDoctorUpvote(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["doctorID","articleID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Check if the Doctor Vote
            const vote = await Database.getRepository(ArticleDoctorVotes).findOneBy({article:{id:reqData['articleID']},doctor:{id:reqData['doctorID']}})
            if(vote === null){
                return responseGenerater.notFound
            }

            // Delete the Article Vote
            await Database.getRepository(ArticleDoctorVotes)
            .createQueryBuilder('ArticleDoctorVotes')
            .delete()
            .from(ArticleDoctorVotes)
            .where("article.id = :articleID", { articleID: reqData['articleID'] })
            .andWhere("doctor.id = doctorID",{ doctorID: reqData['doctorID']})
            .execute()
            
            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Patient can Upvote for an Article
    async PatientUpVote(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["patientID","articleID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // get Article Info
            const art = await Database.getRepository(Article)
            .createQueryBuilder("doctorArt")
            .innerJoinAndSelect("doctorArt.doctor",'doctor')
            .where("doctorArt.id = :articleID",{articleID:reqData['articleID']})
            .getOne()

            if (art === null){
                return responseGenerater.notFound
            }
            
            // check if patient already Voted
            const vote = await Database.getRepository(ArticleVotes).findOneBy({article:{id:reqData['articleID']},patient:{id:reqData['patientID']}})
            if(vote !== null){
                return responseGenerater.custom(403,"You Can Only Vote Once")
            }

            // Createing new Vote
            const newUpvote = new ArticleVotes()
            newUpvote.article = art
            newUpvote.patient = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})

            // Save it to the DB
            await Database.getRepository(Article).save(newUpvote)
            
            // Send a Notification To The Article Writer
            const notifyText = art.title.length > 20 ? art.title.substring(0, 20) + '...' : art.title;
            await NotificationFunctions.sendDoctorNotification(art.doctor.id,'Interactions','a Patient Voted For Your Article',notifyText)
            
            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Remove Patient Up Vote
    async RemovePatientUpvote(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["patientID","articleID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Check if the Patient Vote
            const vote = await Database.getRepository(ArticleVotes).findOneBy({article:{id:reqData['articleID']},patient:{id:reqData['patientID']}})
            if(vote === null){
                return responseGenerater.notFound
            }

            // Delete the Article Vote
            await Database.getRepository(ArticleVotes)
            .createQueryBuilder('ArticleVotes')
            .delete()
            .from(ArticleVotes)
            .where("article.id = :articleID", { articleID: reqData['articleID'] })
            .andWhere("patient.id = patientID",{ patientID: reqData['patientID']})
            .execute()
            
            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Mark an Article as Seen
    async PatientMarkAsSeen(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["patientID","articleID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Check if the Patient See this Article Already
            const seenRecord = await Database.getRepository(ArticleSeen).findOneBy({article:{id:reqData['articleID']},patient:{id:reqData['patientID']}})
            if (seenRecord !== null){
                return responseGenerater.done
            }

            // Create New Record
            const newSeenRecord = new ArticleSeen()
            newSeenRecord.article = await Database.getRepository(Article).findOneBy({id:reqData['articleID']}) 
            newSeenRecord.patient = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']}) 
            
            // Check if Eny of the PatientID or articleID is Wrong
            if(newSeenRecord.article === null || newSeenRecord.patient === null){
                return responseGenerater.custom(403,"The Data you Entered is Wrong")
            }

            // Save it to DB
            await Database.getRepository(ArticleSeen).save(newSeenRecord)
            return responseGenerater.done
            
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

    //-------------------------------------------------------------------------------------------
    //----------------------------------- Article Comments --------------------------------------
    //-------------------------------------------------------------------------------------------

    // Doctor Comment
    async DoctorAddComment(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['doctorID',"articleID","comment","date"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Get the Doctor and Article Info
            const doctorInfo = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            const articleInfo = await Database.getRepository(Article)
            .createQueryBuilder("doctorArt")
            .innerJoinAndSelect("doctorArt.doctor",'doctor')
            .where("doctorArt.id = :articleID",{articleID:reqData['articleID']})
            .getOne()

            // Check if Eny Thing is Missing
            if (doctorInfo === null || articleInfo === null){
                return responseGenerater.notFound
            }
            
            // Creating the New Comment
            const newComment    = new ArticleComment()
            newComment.article  = articleInfo
            newComment.doctor   = doctorInfo
            newComment.comment  = reqData['comment']
            newComment.date     = new Date(reqData["date"])
            
            // Save It To DB
            await Database.getRepository(ArticleComment).save(newComment)
            
            // Send a Notification To The Article Writer
            const notifyText = articleInfo.title.length > 20 ? articleInfo.title.substring(0, 20) + '...' : articleInfo.title;
            await NotificationFunctions.sendDoctorNotification(articleInfo.doctor.id,'Interactions','a Doctor Commented on Your Article',notifyText)


            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Doctor Remove his Comment
    async RemoveDoctorComment(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["doctorID",'commentID'])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Get Comment Info
            const comment = await Database.getRepository(ArticleComment)
            .createQueryBuilder("comment")
            .where("comment.id = :commentID",{commentID : reqData['commentID']})
            .innerJoinAndSelect("comment.doctor","doctor")
            .getOne()

            if (comment === null){
                return responseGenerater.notFound
            }else if(comment.doctor.id !== reqData["doctorID"]){
                return responseGenerater.custom(401,"You are Not Autherized to Delete this Comment")
            }

            // Delete the Likes Related to the Comment
            await Database.getRepository(ArticleCommentsLike)
            .createQueryBuilder('ArticleCommentsLike')
            .delete()
            .from(ArticleCommentsLike)
            .where("comment.id = :commentID",{commentID : reqData['commentID']})
            .execute()

            // Delete the Comment
            await Database.getRepository(ArticleComment)
            .createQueryBuilder('ArticleComment')
            .delete()
            .from(ArticleComment)
            .where("id = :commentID",{commentID : reqData['commentID']})
            .execute()


            return responseGenerater.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Doctors Add Likes to a comment
    async DoctorLikeComment(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["doctorID",'commentID'])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Check if The Doctor Like it Already
            const like = await Database.getRepository(ArticleCommentsLike).findOneBy({comment:{id:reqData['commentID']},doctor:{id:reqData['doctorID']}})
            
            if(like !== null){
                return responseGenerater.sendError("You Alreay Liked This Comment")
            }

            // Get the Article Info
            const article = await Database.getRepository(ArticleComment)
            .createQueryBuilder("ArticleComment")
            .where("ArticleComment.id = :commentID",{commentID:reqData['commentID']})
            .innerJoinAndSelect("ArticleComment.article","article")
            .innerJoinAndSelect("ArticleComment.doctor","doctor")
            .getOne()
            
            // Check if the Data Exist
            if (article === null ){
                return responseGenerater.notFound
            }

            // Creating New Entity
            const newLike = new ArticleCommentsLike()
            newLike.comment = await Database.getRepository(ArticleComment).findOneBy({id:reqData['commentID']})
            newLike.doctor  = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            newLike.article = article.article

            // Check if the Data Exist
            if (newLike.doctor === null || newLike.doctor=== null){
                return responseGenerater.notFound
            }
            
            // Save to DB
            await Database.getRepository(ArticleCommentsLike).save(newLike)


            // Send a Notification To The Comment Writer
            const notifyText = article.comment.length > 20 ? article.comment.substring(0, 20) + '...' : article.comment;
            await NotificationFunctions.sendDoctorNotification(article.doctor.id,'Interactions','Someone Reacted on Your Comment',notifyText)

             
            return responseGenerater.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }
    }

    // Remove a Like from A Comment
    async RemoveCommentLike(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,["doctorID",'commentID'])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Check if The Doctor Like it Already
            const like = await Database.getRepository(ArticleCommentsLike).findOneBy({comment:{id:reqData['commentID']},doctor:{id:reqData['doctorID']}})
            if(like === null){
                return responseGenerater.sendError("You Didn't Liked This Comment")
            }
            
            //Remove the Like
            await Database.getRepository(ArticleCommentsLike)
            .createQueryBuilder('ArticleCommentsLike')
            .delete()
            .from(ArticleCommentsLike)
            .where("comment.id = :commentID",{commentID : reqData['commentID']})
            .andWhere("doctor.id = :doctorID",{doctorID : reqData['doctorID']})
            .execute()

            return responseGenerater.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

    //-------------------------------------------------------------------------------------------
    //---------------------------------- Article Saved List -------------------------------------
    //-------------------------------------------------------------------------------------------

    // Patient Saving this Article in Saved List
    async GetAllSavedList(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['patientID',"loadBlock"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // get and Send the List
            const articleList = await Database.getRepository(SavedArticle)
            .createQueryBuilder("saved")
            .innerJoinAndSelect("saved.article","article")
            .innerJoinAndSelect("article.doctor","doctor")
            .innerJoinAndSelect("article.category","category")
            .where("saved.patient.id = :patientID" ,{patientID:reqData['patientID']})
            .select([
                "article.id as id",
                "article.title as title",
                "article.covorImage as covorImage",
                "article.date as date",
                "article.views as views",
                "category.category as category",
                "doctor.name as doctorName",
                "doctor.title as doctorTitle",
                "doctor.profileImage as doctorProfileImage",
                "doctor.starRate as doctorStarRate",
                "doctor.completedSessions as doctorSessionNumber"
            ])
            .orderBy('article.date', 'DESC')
            .limit(15)
            .offset(15* (Number(reqData['loadBlock'])-1))
            .getRawMany()

            // Adding the Up-Thumbs Votes and seen Count
            for(var i= 0;i<articleList.length;i++){
                articleList[i]['upVotes'] = await Database.getRepository(ArticleVotes).countBy({article:{id:articleList[i].id}}) 
                articleList[i]['seenCount'] = await Database.getRepository(ArticleSeen).countBy({article:{id:articleList[i].id}}) 
            }

            return responseGenerater.sendData(articleList)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

    // Patient Saving this Article in Saved List
    async saveArticleToSavedList(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['patientID',"articleID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Make New Saved Entity
            const newSave = new SavedArticle()
            newSave.article = await Database.getRepository(Article).findOneBy({id:reqData["articleID"]})
            newSave.patient = await Database.getRepository(Patient).findOneBy({id:reqData["patientID"]})

            // check if The Data is Wrong
            if (newSave.article === null || newSave.patient === null){
                return responseGenerater.custom(403,"The Data you Entered is Wrong")
            }

            // Save it to DB
            await Database.getRepository(SavedArticle).save(newSave)

            return responseGenerater.done 
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

    // Patient Remove this Article From Saved List
    async RemoveArticleFromSavedList(reqData){
        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['patientID',"articleID"])
        if (checkParams){
            return responseGenerater.sendMissingParam(checkParams)
        }
        try{
            // Make New Saved Entity
            const saved = await Database.getRepository(SavedArticle).findOneBy({article:{id:reqData['articleID']},patient:{id:reqData["patientID"]}})

            // Check undefined
            if (saved === null){
                return responseGenerater.notFound
            }

            // Remove the Article
            await Database.getRepository(SavedArticle)
            .createQueryBuilder('SavedArticle')
            .delete()
            .from(SavedArticle)
            .where("article.id = :articleID",{articleID : reqData['articleID']})
            .andWhere("patient.id = :patientID",{patientID : reqData['patientID']})
            .execute()
        

            return responseGenerater.done 
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerater.Error
        }

    }

}

export default new BlogFunctions();

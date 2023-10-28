import { Database } from "../../data-source";
import { Article } from "../../entity/Blog/Article";
import { ArticleDoctorVotes } from "../../entity/Blog/ArticleDoctorVotes";
import { ArticleImages } from "../../entity/Blog/ArticleImages";
import { ArticleSeen } from "../../entity/Blog/ArticleSeen";
import { ArticleVotes } from "../../entity/Blog/ArticleVotes";
import { Categories } from "../../entity/Blog/Categories";
import { Doctor } from "../../entity/users/Doctor";
import checkUndefined from "../../middleFunctions/checkUndefined";
import commonResposes from "../../middleFunctions/commonResposes";


class BlogFunctions{

 
    // Get All Approved Categories List
    async GetCategoriesList(reqData){
        try{
            // Get All The List of Categories
            const CategoryList = await  Database.getRepository(Categories).findBy({approved:true})
            return commonResposes.sendData(CategoryList)

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Make a Doctor Suggest New Category for Blog Articls
    async RequestNewCategory(reqData){
        // Check Parameter Existence
        if (checkUndefined(reqData,['categoryName','description'])){
            return commonResposes.missingParam
        }
        try{
            // Create New Not Approved Category that is Waiting to Be Approved
            const newCategory       = new Categories()
            newCategory.category    = reqData['categoryName']
            newCategory.description = reqData['description']

            // Save it to DB
            await Database.getRepository(Categories).save(newCategory)

            return commonResposes.done

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }

    }
 
    // Get all Articles Related to a Doctor
    async GetDoctorArticleList(reqData){
        // Check Parameter Existence
        if (checkUndefined(reqData,['doctorID'])){
            return commonResposes.missingParam
        }
        try{
            // get and Send the List
            const articleList = await Database.getRepository(Article).findBy({doctor:{id:reqData['doctorID']}})


            // Adding the Up-Thumbs Votes and seen Count
            for(var i= 0;i<articleList.length;i++){
                articleList[i]['upVotes'] = await Database.getRepository(ArticleVotes).countBy({article:{id:articleList[i].id}}) 
                articleList[i]['seen'] = await Database.getRepository(ArticleSeen).countBy({article:{id:articleList[i].id}}) 
            }

            return commonResposes.sendData(articleList)

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // View a Single Article
    async ViewAnArticle(reqData){
        // Check Parameter Existence
        if (checkUndefined(reqData,['doctorID','articleID'])){
            return commonResposes.missingParam
        }
        try{
            // Get the Article Info
            const articleInfo = await Database.getRepository(Article).findOneBy({id:reqData['articleID'],doctor:{id:reqData['doctorID']}})
            
            // Check if The Article Not Found
            if(articleInfo === null){
                return commonResposes.notFound
            }

            // adding the Attachment Images
            articleInfo['images'] = await Database.getRepository(ArticleImages).findBy({article:{id:articleInfo.id}}) 

            // Adding the Up-Thumbs Votes and seen Count
            articleInfo['upVotes'] = await Database.getRepository(ArticleVotes).countBy({article:{id:articleInfo.id}}) 
            articleInfo['DoctorUpVotes'] = await Database.getRepository(ArticleDoctorVotes).countBy({article:{id:articleInfo.id}}) 
            articleInfo['seen'] = await Database.getRepository(ArticleSeen).countBy({article:{id:articleInfo.id}}) 
            

            return commonResposes.sendData(articleInfo)

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // make a Doctor Post New Article
    async postNewArticle(reqData){
        // Check Parameter Existence
        if (checkUndefined(reqData,['doctorID','title','mainText','date','categoryID'])){
            return commonResposes.missingParam
        }
        try{
            // Create New Article
            const newArticle      = new Article()
            newArticle.date       = new Date(reqData['date'])
            newArticle.title      = reqData['title']
            newArticle.covorImage = reqData['coverImage']
            newArticle.mainText   = reqData["mainText"]
            newArticle.doctor     = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            newArticle.category   = await Database.getRepository(Categories).findOneBy({id:reqData['categoryID']})

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

            // Save it To DB
            await Database.getRepository(Article).save(newArticle)

            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Make a Doctor Edit His Posted Article
    async EditArticle(reqData){
        // Check Parameter Existence
        if (checkUndefined(reqData,['articleID','doctorID','title','mainText','date','categoryID'])){
            return commonResposes.missingParam
        }
        try{
            // get The Article info If Exist
            const article = await Database.getRepository(Article).findOneBy({id:reqData['articleID'],doctor:{id:reqData['doctorID']}})
            if(article === null){
                return commonResposes.notFound
            }

            // Edit the Article Info
            article.category = await Database.getRepository(Categories).findOneBy({id:reqData['categoryID']})
            article.covorImage = reqData['covorImage']
            article.date       = reqData['date']
            article.title      = reqData['title']
            article.mainText   = reqData['mainText']
            
            // Save Changes To Database
            await Database.getRepository(Article).save(article)

            return commonResposes.done

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Make a Doctor Remove his Posted Article
    async DeleteArticle(reqData){
        // Check Parameter Existence
        if (checkUndefined(reqData,['articleID','doctorID'])){
            return commonResposes.missingParam
        }
        try{
            // Check If Article Exist
            const article = await Database.getRepository(Article).findOneBy({id:reqData['articleID'],doctor:{id:reqData['doctorID']}})
            if(article === null){
                return commonResposes.notFound
            }
            
            // Delete the Article
            await Database.getRepository(Article)
            .createQueryBuilder('Article')
            .delete()
            .from(Article)
            .where("id = :articleID", { articleID: reqData['articleID'] })
            .andWhere("doctor.id = doctorID",{ doctorID: reqData['doctorID']})
            .execute()

            return commonResposes.done

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }
}




export default new BlogFunctions();

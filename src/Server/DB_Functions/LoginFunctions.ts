import { Database } from "../../data-source";
import { Doctor } from "../../entity/users/Doctor";
import { LoginRouter } from "../../entity/login/LoginRouter";
import { Patient } from "../../entity/users/Patient";
import { Admin } from "../../entity/users/admin";
import CommonResponse from "../../middleFunctions/commonResposes";
import checkUndefined from "../../middleFunctions/checkUndefined";
import SendMail from "../../middleFunctions/sendMail";
import commonResposes from "../../middleFunctions/commonResposes";
import { ConfirmCode } from "../../entity/login/confirmationCode";
const bcrypt = require("bcrypt")
var jwt = require('jsonwebtoken');

class LoginFunctions{



    /////// Functions

    //Login Route
    async Login(loginData){

        // Handle Missing Param
        if (checkUndefined(loginData,["email","password"])){
            return CommonResponse.missingParam
        }

        console.log(await bcrypt.hash(loginData['password'],10))
        // Check if the User Exist
        const User = await Database.getRepository(LoginRouter).findOneBy({email:loginData['email']})
        if (User === null){
            return CommonResponse.notFound
        }
        // Check Password Correctness
        // else if (! await bcrypt.compare(User['password'], loginData['password'])){
        else if (User['password']!== loginData['password']){
            return CommonResponse.wrongPassword
        }

        // Build The JWT and Return User's Info
        try{
            var userInfo;

            // CHeck Users Role
            if (User['role'].toLowerCase() === 'patient'){
                userInfo = await Database.getRepository(Patient).findOneBy({id:User['userID']})
            }else if (User['role'].toLowerCase() === 'doctor'){
                userInfo = await Database.getRepository(Doctor).findOneBy({id:User['userID']})
            }else if (User['role'].toLowerCase() === "admin"){
                userInfo = await Database.getRepository(Admin).findOneBy({id:User['userID']})
            }
            const JWTInfo = {
                "id":User['userID'],
                'email':User['email'],
                "password":User['password']
            }

            //Generat JWT That Last For 10 Days
            const genratedJWT = jwt.sign( JWTInfo,process.env.JWTsecret,{ expiresIn: 60 * 60 *24*10 } ) 

            // Add The MetaData
            userInfo['email'] = User['email']
            userInfo['role'] = User['role']
            userInfo['jwt'] = genratedJWT

            return CommonResponse.sendData(userInfo)
        }catch(err){
            console.log(err)
            return CommonResponse.Error
        }

    }

    // General Signup using Just Email and Password
    async Signup(reqData){

        // Check Parameter Existance
        if (checkUndefined(reqData,["email","password","role"])){
            return commonResposes.missingParam
        }
        try{
            // Check if the Email Already in User
            const checkExist = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (checkExist !== null){
                return commonResposes.alreadyExist
            }   
            
            // Create New Login Route with Role Check
            const newLoginRouter    = new LoginRouter()
            newLoginRouter.email    = reqData['email']
            newLoginRouter.password = await  bcrypt.hash(reqData['password'],10)
            if (reqData['role'].toLowerCase() === 'doctor' || reqData['role'].toLowerCase() === 'patient'){
                newLoginRouter.role     = reqData["role"].toLowerCase()
            }else{

                // The role is Entered Wrong
                return commonResposes.Error
            }
            // Base UserID Number
            newLoginRouter.userID   = -1
            await Database.getRepository(LoginRouter).save(newLoginRouter)


            // Create A Confirmation Code and Store it in DB
            const fourDigitsVerficationConde = `${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}`
            const newVerCode = new ConfirmCode()
            newVerCode.email = reqData['email']
            newVerCode.code  = fourDigitsVerficationConde
            newVerCode.expiresIn =  new Date(new Date().getTime() + 2 * 60 * 1000);
            await Database.getRepository(ConfirmCode).save(newVerCode)

            // Send Email with the Confirmation Code
            SendMail(reqData['email'],"Confirm Your Email",`Welcome To Ta3afi, here your Code to Verify Your Email ${fourDigitsVerficationConde}`)
            return commonResposes.sendData("Verfication Code Sent")
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Re Send the Confirmation Code as a Seprated Function
    async reSendConfirmCode(reqData){

        // Check Parameter Existance
        if (checkUndefined(reqData,["email"])){
            return commonResposes.missingParam
        }
        try{
            
            // Check if the Email is Having a Pre Sent Code
            const preCode = await Database.getRepository(ConfirmCode).findOneBy({email:reqData['email']})
            const fourDigitsVerficationConde = `${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}`
            
            // Update the Existing Email Code
            if (preCode !== null){
                preCode.code = fourDigitsVerficationConde
                preCode.expiresIn =  new Date(new Date().getTime() + 2 * 60 * 1000);
                await Database.getRepository(ConfirmCode).save(preCode)
            }
            
            //Create the Code as New
            else{
                const newVerCode = new ConfirmCode()
                newVerCode.email = reqData['email']
                newVerCode.code  = fourDigitsVerficationConde
                newVerCode.expiresIn =  new Date(new Date().getTime() + 2 * 60 * 1000);
                await Database.getRepository(ConfirmCode).save(newVerCode)
            }

            // Send Email With the Code
            SendMail(reqData['email'],"Confirm Your Email",`Welcome To Ta3afi,\nhere is your Code to Confirm Your Email: ${fourDigitsVerficationConde}`)
            return commonResposes.sendData("Confirmation Code Sent")
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Check if the Code is Correct and on Date
    async verifyCode(reqData){

        // Check Parameter Existance
        if (checkUndefined(reqData,["email","code"])){
            return commonResposes.missingParam
        }
        try{
            // Get the Code Info and Check if it Even Exist
            const code = await Database.getRepository(ConfirmCode).findOneBy({email:reqData['email']})
            if (code === null){
                return commonResposes.notFound
            }
            // Check Code Expiration Date
            const currentDate = new Date()
            if (currentDate > code.expiresIn){
                return commonResposes.sendError("Code Expired")
            }

            // Check if the Entered Code is Not Correct
            else if (code.code !== reqData['code']){
                return commonResposes.sendError("Wrong Code")
            }
            
            // The Code is Correct
            else{
                // Update the Confirmed Status on Login Router
                const loginRoute = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
                loginRoute.confirmed = true
                await Database.getRepository(LoginRouter).save(loginRoute)

                // Remove Confirmation Code from DB
                await Database
                .getRepository(ConfirmCode)
                .createQueryBuilder('ConfirmCode')
                .delete()
                .from(ConfirmCode)
                .where("email = :email", { email: reqData['email'] })
                .execute()
                
                // Return to the FrontEnd
                return commonResposes.sendData("Code Verified")
            }
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }
}

export default new LoginFunctions();
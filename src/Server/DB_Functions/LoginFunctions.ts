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


    async Signup(reqData){
        if (checkUndefined(reqData,["email","password","role"])){
            return commonResposes.missingParam
        }
        try{
            const checkExist = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (checkExist !== null){
                return commonResposes.alreadyExist
            }


            const newLoginRouter    = new LoginRouter()
            newLoginRouter.email    = reqData['email']
            newLoginRouter.password = await  bcrypt.hash(reqData['password'],10)
            if (reqData['role'].toLowerCase() === 'doctor' || reqData['role'].toLowerCase() === 'patient'){
                newLoginRouter.role     = reqData["role"].toLowerCase()
            }else{
                return commonResposes.Error
            }
            newLoginRouter.userID   = -1
            await Database.getRepository(LoginRouter).save(newLoginRouter)


            const fourDigitsVerficationConde = `${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}`
            const newVerCode = new ConfirmCode()
            newVerCode.email = reqData['email']
            newVerCode.code  = fourDigitsVerficationConde
            newVerCode.expiresIn =  new Date(new Date().getTime() + 2 * 60 * 1000);
            await Database.getRepository(ConfirmCode).save(newVerCode)

            SendMail("omarahmedelnemr16@gmail.com","Confirm Your Email",`Welcome To Ta3afi, here your Code to Verify Your Email ${fourDigitsVerficationConde}`)
            return commonResposes.sendData("Verfication Code Sent")
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    async reSendConfirmCode(reqData){
        if (checkUndefined(reqData,["email"])){
            return commonResposes.missingParam
        }
        try{
            const preCode = await Database.getRepository(ConfirmCode).findOneBy({email:reqData['email']})
            const fourDigitsVerficationConde = `${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}`
            if (preCode !== null){
                preCode.code = fourDigitsVerficationConde
                preCode.expiresIn =  new Date(new Date().getTime() + 2 * 60 * 1000);
                await Database.getRepository(ConfirmCode).save(preCode)
            }else{
                const newVerCode = new ConfirmCode()
                newVerCode.email = reqData['email']
                newVerCode.code  = fourDigitsVerficationConde
                newVerCode.expiresIn =  new Date(new Date().getTime() + 2 * 60 * 1000);
                await Database.getRepository(ConfirmCode).save(newVerCode)
            }
            SendMail("omarahmedelnemr16@gmail.com","Confirm Your Email",`Welcome To Ta3afi,\nhere is your Code to Confirm Your Email: ${fourDigitsVerficationConde}`)
            return commonResposes.sendData("Confirmation Code Sent")
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }
    async verifyCode(reqData){
        if (checkUndefined(reqData,["email","code"])){
            return commonResposes.missingParam
        }
        try{
            const code = await Database.getRepository(ConfirmCode).findOneBy({email:reqData['email']})
            if (code === null){
                return commonResposes.notFound
            }
            const currentDate = new Date()
            if (currentDate > code.expiresIn){
                return commonResposes.sendError("Code Expired")
            }else if (code.code !== reqData['code']){
                return commonResposes.sendError("Wrong Code")
            }else{
                const loginRoute = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
                loginRoute.confirmed = true
                await Database.getRepository(LoginRouter).save(loginRoute)

                await Database
                .getRepository(ConfirmCode)
                .createQueryBuilder('ConfirmCode')
                .delete()
                .from(ConfirmCode)
                .where("email = :email", { email: reqData['email'] })
                .execute()
                
                return commonResposes.sendData("Code Verified")
            }
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }
}

export default new LoginFunctions();
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
import { DoctorEducaion } from "../../entity/DoctorInfo/DoctorEducaion";
import { DoctorExperince } from "../../entity/DoctorInfo/DoctorExperince";
import { DoctorCertificate } from "../../entity/DoctorInfo/DoctorCertificate";
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

        // Check if the User Exist
        const User = await Database.getRepository(LoginRouter).findOneBy({email:loginData['email']})
        if (User === null){
            return CommonResponse.notFound
        }
        // Check Password Correctness
        else if (! await bcrypt.compare(loginData['password'], User['password'])){
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

    // Complete the Signup for Doctors (main Info)
    async AddDoctorMainInfo(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","name","birthDate","gender","title","description"])){
            return commonResposes.missingParam
        }
        try{
            const loginInfo = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (loginInfo === null){
                return commonResposes.notFound
            }

            // Create New Doctor Entity
            const newDoctor        = new Doctor()
            newDoctor.name         = reqData['name']
            newDoctor.title        = reqData['title']
            newDoctor.description  = reqData['description']
            newDoctor.birthDate    = new Date(reqData['birthDate'])
            newDoctor.gender       = reqData['gender']
            await Database.getRepository(Doctor).save(newDoctor)
            
            // Update the User ID on the Login Route
            loginInfo.userID = newDoctor.id
            await Database.getRepository(LoginRouter).save(loginInfo)

            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Complete the Signup for Doctors (Education)
    async AddDoctorEducation(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","educaion"])){
            return commonResposes.missingParam
        }
        try{

            // Gettig the Login Info For Next Steps
            const LoginInfo = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (LoginInfo === null){
                return commonResposes.notFound
            }

            // Get Doctors DB Entity
            const currentDoctor = await Database.getRepository(Doctor).findOneBy({id:LoginInfo.userID})
                        
            // Adding Doctors Educations
            for(var edu of reqData['educaion']){
                var newEducation     = new DoctorEducaion()
                newEducation.doctor    = currentDoctor
                newEducation.title     = edu['title']
                newEducation.place     = edu['place']
                newEducation.startDate = new Date(edu['startDate'])
                newEducation.endDate   = new Date(edu['endDate'])
                await Database.getRepository(DoctorEducaion).save(newEducation)
            }
            return commonResposes.done

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Complete the Signup for Doctors (Experince)
    async AddDoctorExperince(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","experince"])){
            return commonResposes.missingParam
        }
        try{

            // Gettig the Login Info For Next Steps
            const LoginInfo = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (LoginInfo === null){
                return commonResposes.notFound
            }

            // Get Doctors DB Entity
            const currentDoctor = await Database.getRepository(Doctor).findOneBy({id:LoginInfo.userID})

            // Adding Doctors Experince
            for(var exp of reqData['experince']){
                var newExperince    = new DoctorExperince()
                newExperince.doctor    = currentDoctor
                newExperince.title     = exp['title']
                newExperince.place     = exp['place']
                newExperince.startDate = new Date(exp['startDate'])
                newExperince.endDate   = new Date(exp['endDate'])
                await Database.getRepository(DoctorExperince).save(newExperince)
            }
            return commonResposes.done

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Complete the Signup for Doctors (Certificate)
    async AddDoctorCertificate(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","certificate"])){
            return commonResposes.missingParam
        }
        try{

            // Gettig the Login Info For Next Steps
            const LoginInfo = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (LoginInfo === null){
                return commonResposes.notFound
            }

            // Get Doctors DB Entity
            const currentDoctor = await Database.getRepository(Doctor).findOneBy({id:LoginInfo.userID})

            // Adding Doctor Certificate
            for(var Cert of reqData['certificate']){
                var newCertificate     = new DoctorCertificate()
                newCertificate.doctor    = currentDoctor
                newCertificate.title     = Cert['title']
                newCertificate.place     = Cert['place']
                newCertificate.startDate = new Date(Cert['startDate'])
                newCertificate.endDate   = new Date(Cert['endDate'])
                await Database.getRepository(DoctorCertificate).save(newCertificate)
            }
            return commonResposes.done

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Complete the Signup for Patients (main Info)
    async addPatientMainInfo(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","name","birthDate","gender"])){
            return commonResposes.missingParam
        }
        try{
            // Check if Email Exist
            const loginInfo = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (loginInfo === null){
                return commonResposes.notFound
            }

            // Create New Patient Entity
            const newPatient        = new Patient()
            newPatient.name         = reqData['name']
            newPatient.birthDate    = new Date(reqData['birthDate'])
            newPatient.gender       = reqData['gender']
            await Database.getRepository(Patient).save(newPatient)
            
            // Update the User ID on the Login Route
            loginInfo.userID = newPatient.id
            await Database.getRepository(LoginRouter).save(loginInfo)

            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    async changePassword(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","oldPassword","newPassword"])){
            return commonResposes.missingParam
        }
        try{
            // Get User's Login Information
            const loginInfo = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (loginInfo === null){
                return commonResposes.notFound
            }

            // Check if old Password is Correct
            if (! await bcrypt.compare(reqData['oldPassword'],loginInfo.password)){
                return commonResposes.wrongPassword
            }

            // Change the Password
            loginInfo.password = await bcrypt.hash(reqData['newPassword'],10)
            await Database.getRepository(LoginRouter).save(loginInfo)

            // Send Notification Mail
            SendMail(reqData['email'],"Password Changed","Hello,\nWe Would Like to Tell You That You Changed Your Password Successfully,\nif You are not the One who Change It, please Contact us Immediately")
            return commonResposes.sendData("Password Changed Successfully")
            
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }





    async sendForgetPasswordEmail(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email"])){
            return commonResposes.missingParam
        }
        try{
            
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }




    async DeleteAccount(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","password"])){
            return commonResposes.missingParam
        }
        try{
            // Get The User's Login Info and check if Exist
            const loginInfo = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (loginInfo === null){
                return commonResposes.notFound
            }

            //check if Password is Right
            if (! await bcrypt.compare(reqData['password'],loginInfo['password'])){
                return commonResposes.wrongPassword
            }

            // Check if user Data is Complete
            if (loginInfo['completeInfo']){

                // Remove User's Name and Info 

            }

            // Remove the Login Route for This User
            await Database
            .getRepository(LoginRouter)
            .createQueryBuilder('LoginRouter')
            .delete()
            .from(LoginRouter)
            .where("email = :email", { email: reqData['email'] })
            .execute()



        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }
}

export default new LoginFunctions();
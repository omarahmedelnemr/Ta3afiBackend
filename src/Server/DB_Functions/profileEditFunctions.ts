import { Database } from "../../data-source";
import { Doctor } from "../../entity/users/Doctor";
import { LoginRouter } from "../../entity/login/LoginRouter";
import checkUndefined from "../../middleFunctions/checkUndefined";
import commonResposes from "../../middleFunctions/commonResposes";
import { DoctorEducaion } from "../../entity/DoctorInfo/DoctorEducaion";
import { DoctorExperince } from "../../entity/DoctorInfo/DoctorExperince";
import { DoctorCertificate } from "../../entity/DoctorInfo/DoctorCertificate";
import SendMail from "../../middleFunctions/sendMail";
const bcrypt = require("bcrypt")

class profileEditFunctions{

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

        // Change Users Password
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
}

export default new profileEditFunctions();
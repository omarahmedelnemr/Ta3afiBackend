import { Database } from "../../data-source";
import { Doctor } from "../../entity/users/Doctor";
import { LoginRouter } from "../../entity/login/LoginRouter";
import checkUndefined from "../../middleFunctions/checkUndefined";
import commonResposes from "../../middleFunctions/commonResposes";
import { DoctorEducation } from "../../entity/DoctorInfo/DoctorEducation";
import { DoctorExperince } from "../../entity/DoctorInfo/DoctorExperince";
import { DoctorCertificate } from "../../entity/DoctorInfo/DoctorCertificate";
import SendMail from "../../middleFunctions/sendMail";
import { ConfirmCode } from "../../entity/login/confirmationCode";
import { Patient } from "../../entity/users/Patient";
import { DoctorTag } from "../../entity/DoctorInfo/Tags";
import { Hobby } from "../../entity/PatientInfo/hobby";
const bcrypt = require("bcrypt")

class profileEditFunctions{
    //---------------------------------------------------------------------------------------------
    //------------------------------------ General Endpoints --------------------------------------
    //---------------------------------------------------------------------------------------------

    // Change Email Used in Login
    async confirmChangeEmail(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["oldEmail","newEmail","code"])){
            return commonResposes.missingParam
        }
        try{
            // Get the Code Info and Check if it Even Exist
            const code = await Database.getRepository(ConfirmCode).findOneBy({email:reqData['newEmail']})
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
                const loginInfo = await Database.getRepository(LoginRouter).findOneBy({email:reqData["oldEmail"]})
                if (loginInfo === null){
                    return commonResposes.notFound
                }   
                loginInfo.email = reqData['newEmail']

                // Remove Old Login Route 
                await Database
                .getRepository(LoginRouter)
                .createQueryBuilder('login')
                .delete()
                .from(LoginRouter)
                .where("email = :email", { email: reqData['oldEmail'] })
                .execute()
                
                // Create New Login Route
                await Database.getRepository(LoginRouter).save(loginInfo)

                // Remove Confirmation Code from DB
                await Database
                .getRepository(ConfirmCode)
                .createQueryBuilder('ConfirmCode')
                .delete()
                .from(ConfirmCode)
                .where("email = :email", { email: reqData['newEmail'] })
                .execute()

                return commonResposes.done
            }
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


    //---------------------------------------------------------------------------------------------
    //------------------------------------- Doctor Endpoints --------------------------------------
    //---------------------------------------------------------------------------------------------

    // Change Doctor Name
    async changeDoctorName(reqData){
        if (checkUndefined(reqData,['id','newName'])){
            return commonResposes.missingParam
        }
        // Get Doctor's Info
        const doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['id']})
        if (doctor === undefined){
            return commonResposes.notFound
        }

        // Change Doctor's Name
        doctor.name = reqData['newName']

        // Save Changes To DB
        await Database.getRepository(Doctor).save(doctor)

        return commonResposes.done
    }

    // Change Doctor Title
    async changeDoctorTitle(reqData){
        if (checkUndefined(reqData,['id','newTitle'])){
            return commonResposes.missingParam
        }
        // Get Doctor's Info
        const doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['id']})
        if (doctor === undefined){
            return commonResposes.notFound
        }

        // Change Doctor's Name
        doctor.title = reqData['newTitle']

        // Save Changes To DB
        await Database.getRepository(Doctor).save(doctor)

        return commonResposes.done
    }
    
    // Change Doctor Birth Date
    async changeDoctorBirthDate(reqData){
        if (checkUndefined(reqData,['id','newBirthDate'])){
            return commonResposes.missingParam
        }
        try{       
            // Get Doctor's Info
            const doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['id']})
            if (doctor === undefined){
                return commonResposes.notFound
            }

            // Change Doctor's Name
            doctor.birthDate = new Date(reqData['newBirthDate'])

            // Save Changes To DB
            await Database.getRepository(Doctor).save(doctor)
            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Edit Doctor's Description
    async EditDescription(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","newDescription"])){
            return commonResposes.missingParam
        }
        try{       
            // Get Doctor's Info
            const doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['id']})
            if (doctor === undefined){
                return commonResposes.notFound
            }

            // Change Doctor's Name
            doctor.description = reqData['newDescription']

            // Save Changes To DB
            await Database.getRepository(Doctor).save(doctor)
            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Complete the Signup for Doctors (Education)
    async AddDoctorEducation(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","title","place","startDate"])){
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
            var newEducation     = new DoctorEducation()
            newEducation.doctor    = currentDoctor
            newEducation.title     = reqData['title']
            newEducation.place     = reqData['place']
            newEducation.startDate = new Date(reqData['startDate'])
            newEducation.endDate   = new Date(reqData['endDate'])
            await Database.getRepository(DoctorEducation).save(newEducation)
            
            return commonResposes.done

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Delete Doctor Education
    async DeleteDoctorEducation(reqData){
        if(checkUndefined(reqData,['doctorID',"recordID"])){
            return commonResposes.missingParam
        }
        try{
            // Check Weather the Record Exist Or not
            const EduRecord = await Database.getRepository(DoctorEducation).findOneBy({id:reqData["recordID"],doctor:{id:reqData['doctorID']}})
            if(EduRecord === null){
                return commonResposes.notFound
            }

            // Remove Confirmation Code from DB
            await Database
            .getRepository(DoctorEducation)
            .createQueryBuilder('Education')
            .delete()
            .from(DoctorEducation)
            .where("id = :recordID", { recordID: reqData['recordID'] })
            .andWhere("doctor.id = doctorID",{ doctorID: reqData['doctorID']})
            .execute()

            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Complete the Signup for Doctors (Experince)
    async AddDoctorExperince(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","title","place","startDate"])){
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
            var newExperince    = new DoctorExperince()
            newExperince.doctor    = currentDoctor
            newExperince.title     = reqData['title']
            newExperince.place     = reqData['place']
            newExperince.startDate = new Date(reqData['startDate'])
            newExperince.endDate   = new Date(reqData['endDate'])
            await Database.getRepository(DoctorExperince).save(newExperince)
            
            return commonResposes.done

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Delete Doctor Experince
    async DeleteDoctorExperince(reqData){
        if(checkUndefined(reqData,['doctorID',"recordID"])){
            return commonResposes.missingParam
        }
        try{

            // Check Weather the Record Exist Or not
            const ExpRecord = await Database.getRepository(DoctorExperince).findOneBy({id:reqData["recordID"],doctor:{id:reqData['doctorID']}})
            if(ExpRecord === null){
                return commonResposes.notFound
            }

            // Remove Confirmation Code from DB
            await Database
            .getRepository(DoctorExperince)
            .createQueryBuilder('Experince')
            .delete()
            .from(DoctorExperince)
            .where("id = :recordID", { recordID: reqData['recordID'] })
            .andWhere("doctor.id = doctorID",{ doctorID: reqData['doctorID']})
            .execute()

            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }
    
    // Complete the Signup for Doctors (Certificate)
    async AddDoctorCertificate(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","title","place","date"])){
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
            var newCertificate     = new DoctorCertificate()
            newCertificate.doctor    = currentDoctor
            newCertificate.title     = reqData['title']
            newCertificate.place     = reqData['place']
            newCertificate.date = new Date(reqData['date'])
            await Database.getRepository(DoctorCertificate).save(newCertificate)
            
            return commonResposes.done

        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Delete Doctor Certificate
    async DeleteDoctorCertificate(reqData){
        if(checkUndefined(reqData,['doctorID',"recordID"])){
            return commonResposes.missingParam
        }
        try{

            // Check Weather the Record Exist Or not
            const CertRecord = await Database.getRepository(DoctorCertificate).findOneBy({id:reqData["recordID"],doctor:{id:reqData['doctorID']}})
            if(CertRecord === null){
                return commonResposes.notFound
            }

            // Remove Confirmation Code from DB
            await Database
            .getRepository(DoctorCertificate)
            .createQueryBuilder('Certificate')
            .delete()
            .from(DoctorCertificate)
            .where("id = :recordID", { recordID: reqData['recordID'] })
            .andWhere("doctor.id = doctorID",{ doctorID: reqData['doctorID']})
            .execute()

            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Add New Doctor Tag
    async AddDoctorTag(reqData){
        
        // Check if Parameters Exist
        if(checkUndefined(reqData,['doctorID',"tag"])){
            return commonResposes.missingParam
        }
        try{
            
            // Perform Some Aditional Checks
            if (reqData['tag'] === ''){
                return commonResposes.sendError("Tag Cannot Be Empty")
            }
            
            // if the Doctor Exceed The Tag Number Limit
            const count =  await Database.getRepository(DoctorTag).countBy({doctor:{id:reqData['doctorID']}})
            if (count >= 5 ){
                return commonResposes.sendError('Doctor Exceeds The Maximum Number of Tags (5)')
            }

            // Check if Tag is Not Already Exist
            const checkTag = await Database.getRepository(DoctorTag).findOneBy({doctor:{id:reqData['doctorID']},tag:reqData['tag']})
            if (checkTag !== null){
                return commonResposes.sendError("This Tag Already Exist")
            }

            // Create New Tag
            const newTag  = new DoctorTag()
            newTag.tag    = reqData['tag']
            newTag.doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})

            // Save it to The DB
            await Database.getRepository(DoctorTag).save(newTag)

            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Removing Doctor Tag
    async DeleteDoctorTag(reqData){

        // Check if Parameters Exist
        if(checkUndefined(reqData,['tagID',"doctorID"])){
            return commonResposes.missingParam
        }
        try{
            // Check if Tag Even Exist
            const checkTag = await Database.getRepository(DoctorTag).findOneBy({doctor:{id:reqData['doctorID']},id:reqData['tagID']})
            if (checkTag === null){
                return commonResposes.notFound
            }

            // Remove The Tag From DB
            await Database
            .getRepository(DoctorTag)
            .createQueryBuilder('Tag')
            .delete()
            .from(DoctorTag)
            .where("id = :tagID", { tagID: reqData['tagID'] })
            .andWhere("doctor.id = doctorID",{ doctorID: reqData['doctorID']})
            .execute()

            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    //---------------------------------------------------------------------------------------------
    //------------------------------------- Patient Endpoints -------------------------------------
    //---------------------------------------------------------------------------------------------

    // Change Patient Name
    async changePatientName(reqData){
        if (checkUndefined(reqData,['id','newName'])){
            return commonResposes.missingParam
        }
        // Get Patinet's Info
        const patient = await Database.getRepository(Patient).findOneBy({id:reqData['id']})
        if (patient === undefined){
            return commonResposes.notFound
        }

        // Change Patient's Name
        patient.name = reqData['newName']

        // Save Changes To DB
        await Database.getRepository(Patient).save(patient)

        return commonResposes.done
    }

    // Change Patient BirthDate
    async changePatientBirthDate(reqData){
        if (checkUndefined(reqData,['id','newBirthDate'])){
            return commonResposes.missingParam
        }
        // Get Patinet's Info
        const patient = await Database.getRepository(Patient).findOneBy({id:reqData['id']})
        if (patient === undefined){
            return commonResposes.notFound
        }

        // Change Patient's Name
        patient.birthDate =new Date(reqData['newBirthDate'])

        // Save Changes To DB
        await Database.getRepository(Patient).save(patient)

        return commonResposes.done
    }

    // Add New Doctor Tag
    async AddPatientHobby(reqData){
    
        // Check if Parameters Exist
        if(checkUndefined(reqData,['patientID',"hobby"])){
            return commonResposes.missingParam
        }
        try{
            
            // Perform Some Aditional Checks
            if (reqData['hobby'] === ''){
                return commonResposes.sendError("Hobby Cannot Be Empty")
            }
            
            // if the User Exceed The Hobby Number Limit
            const count =  await Database.getRepository(Hobby).countBy({patient:{id:reqData['patientID']}})
            if (count >= 5 ){
                return commonResposes.sendError('You Exceeds The Maximum Number of Hobbies (5)')
            }

            // Check if Hobby is Not Already Exist
            const checkHobby = await Database.getRepository(Hobby).findOneBy({patient:{id:reqData['patientID']},hobby:reqData['hobby']})
            if (checkHobby !== null){
                return commonResposes.sendError("This Hobby Already Exist")
            }

            // Create New Hobby
            const newHobby  = new Hobby()
            newHobby.hobby    = reqData['hobby']
            newHobby.patient = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})

            // Save it to The DB
            await Database.getRepository(Hobby).save(newHobby)

            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }

    // Removing Doctor Hobby
    async DeletePatientHobby(reqData){

        // Check if Parameters Exist
        if(checkUndefined(reqData,['hobbyID',"patientID"])){
            return commonResposes.missingParam
        }
        try{
            // Check if Hobby Even Exist
            const checkHobby = await Database.getRepository(Hobby).findOneBy({patient:{id:reqData['patientID']},id:reqData['hobbyID']})
            if (checkHobby === null){
                return commonResposes.notFound
            }

            // Remove The Hobby From DB
            await Database
            .getRepository(Hobby)
            .createQueryBuilder('hobby')
            .delete()
            .from(Hobby)
            .where("id = :hobbyID", { hobbyID: reqData['hobbyID'] })
            .andWhere("patient.id = patientID",{ patientID: reqData['patientID']})
            .execute()

            return commonResposes.done
        }catch(err){
            console.log("Error!\n",err)
            return commonResposes.Error
        }
    }
    
}

export default new profileEditFunctions();
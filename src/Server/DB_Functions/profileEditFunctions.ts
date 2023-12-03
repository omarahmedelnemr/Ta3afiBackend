import { Database } from "../../data-source";
import { Doctor } from "../../entity/users/Doctor";
import { LoginRouter } from "../../entity/login/LoginRouter";
import checkUndefined from "../../middleFunctions/checkUndefined";
import responseGenerator from "../../middleFunctions/responseGenerator";
import { DoctorEducation } from "../../entity/DoctorInfo/DoctorEducation";
import { DoctorExperince } from "../../entity/DoctorInfo/DoctorExperince";
import { DoctorCertificate } from "../../entity/DoctorInfo/DoctorCertificate";
import SendMail from "../../middleFunctions/sendMail";
import { ConfirmCode } from "../../entity/login/confirmationCode";
import { Patient } from "../../entity/users/Patient";
import { DoctorTag } from "../../entity/DoctorInfo/Tags";
import { Hobby } from "../../entity/PatientInfo/hobby";
import { Pricing } from "../../entity/DoctorInfo/Pricing";
import { AvailableDays } from "../../entity/DoctorInfo/AvailableDays";
import { AvailableHour } from "../../entity/DoctorInfo/AvailableHours";
import { Diagnose } from "../../entity/PatientInfo/Diagnosis";
import { Medicine } from "../../entity/PatientInfo/Medicine";
import { PrescriptionFile } from "../../entity/PatientInfo/PrescriptionFile";
import { PatientAccountInfo } from "../../entity/PatientInfo/patientAccountInfo";
const bcrypt = require("bcrypt")

class profileEditFunctions{
    //---------------------------------------------------------------------------------------------
    //------------------------------------ General Endpoints --------------------------------------
    //---------------------------------------------------------------------------------------------

    // Change Email Used in Login
    async confirmChangeEmail(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["oldEmail","newEmail","code"])){
            return responseGenerator.missingParam
        }
        try{
            // Get the Code Info and Check if it Even Exist
            const code = await Database.getRepository(ConfirmCode).findOneBy({email:reqData['newEmail']})
            if (code === null){
                return responseGenerator.notFound
            }

            // Check Code Expiration Date
            const currentDate = new Date()
            if (currentDate > code.expiresIn){
                return responseGenerator.sendError("Code Expired")
            }

            // Check if the Entered Code is Not Correct
            else if (code.code !== reqData['code']){
                return responseGenerator.sendError("Wrong Code")
            }
            
            // The Code is Correct
            else{
                const loginInfo = await Database.getRepository(LoginRouter).findOneBy({email:reqData["oldEmail"]})
                if (loginInfo === null){
                    return responseGenerator.notFound
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

                return responseGenerator.done
            }
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Change Users Password
    async changePassword(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["email","oldPassword","newPassword"])){
            return responseGenerator.missingParam
        }
        try{
            // Get User's Login Information
            const loginInfo = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (loginInfo === null){
                return responseGenerator.notFound
            }

            // Check if old Password is Correct
            if (! await bcrypt.compare(reqData['oldPassword'],loginInfo.password)){
                return responseGenerator.wrongPassword
            }

            // Change the Password
            loginInfo.password = await bcrypt.hash(reqData['newPassword'],10)
            await Database.getRepository(LoginRouter).save(loginInfo)

            // Send Notification Mail
            SendMail(reqData['email'],"Password Changed","Hello,\nWe Would Like to Tell You That You Changed Your Password Successfully,\nif You are not the One who Change It, please Contact us Immediately")
            return responseGenerator.sendData("Password Changed Successfully")
            
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }


    //---------------------------------------------------------------------------------------------
    //------------------------------------- Doctor Endpoints --------------------------------------
    //---------------------------------------------------------------------------------------------

    // Get Doctor Main Info
    async GetDoctorMainInfo(reqData){
        if (checkUndefined(reqData,["doctorID"])){
            return responseGenerator.missingParam
        }
        try{
            const doctorMain = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            if (doctorMain === null){
                return responseGenerator.notFound
            }

            const getEmail = await Database.getRepository(LoginRouter).findOneBy({userID:reqData['doctorID'],role:"doctor"})
            if (getEmail === null){
                return responseGenerator.custom(403,"The Account Data is Missing, Please Contact Support")
            }
            doctorMain['email'] = getEmail.email

            return responseGenerator.sendData(doctorMain)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }

    }

    // Change Doctor Name
    async changeDoctorName(reqData){
        if (checkUndefined(reqData,['doctorID','newName'])){
            return responseGenerator.missingParam
        }
        // Get Doctor's Info
        const doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
        if (doctor === undefined){
            return responseGenerator.notFound
        }

        // Change Doctor's Name
        doctor.name = reqData['newName']

        // Save Changes To DB
        await Database.getRepository(Doctor).save(doctor)

        return responseGenerator.done
    }

    // Change Doctor Title
    async changeDoctorTitle(reqData){
        if (checkUndefined(reqData,['doctorID','newTitle'])){
            return responseGenerator.missingParam
        }
        // Get Doctor's Info
        const doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
        if (doctor === undefined){
            return responseGenerator.notFound
        }

        // Change Doctor's Name
        doctor.title = reqData['newTitle']

        // Save Changes To DB
        await Database.getRepository(Doctor).save(doctor)

        return responseGenerator.done
    }
    
    // Change Doctor Birth Date
    async changeDoctorBirthDate(reqData){
        if (checkUndefined(reqData,['doctorID','newBirthDate'])){
            return responseGenerator.missingParam
        }
        try{       
            // Get Doctor's Info
            const doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            if (doctor === undefined){
                return responseGenerator.notFound
            }

            // Change Doctor's Name
            doctor.birthDate = new Date(reqData['newBirthDate'])

            // Save Changes To DB
            await Database.getRepository(Doctor).save(doctor)
            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Change Doctor Profile Images
    async changeDoctorProfileImage(reqData){
        if (checkUndefined(reqData,['doctorID','imageName'])){
            return responseGenerator.missingParam
        }
        try{       
            // Get Doctor's Info
            const doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            if (doctor === undefined){
                return responseGenerator.notFound
            }

            // Change Doctor's Image
            doctor.profileImage = reqData['imageName']

            // Save Changes To DB
            await Database.getRepository(Doctor).save(doctor)
            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Edit Doctor's Description
    async EditDescription(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["doctorID","newDescription"])){
            return responseGenerator.missingParam
        }
        try{       
            // Get Doctor's Info
            const doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            if (doctor === undefined){
                return responseGenerator.notFound
            }

            // Change Doctor's Name
            doctor.description = reqData['newDescription']

            // Save Changes To DB
            await Database.getRepository(Doctor).save(doctor)
            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Get Doctor Education Records
    async GetDoctorEducationRecords(reqData){
        if (checkUndefined(reqData,["doctorID"])){
            return responseGenerator.missingParam
        }
        try{
            // Getting the Record
            const educationRecords = await Database.getRepository(DoctorEducation).findBy({doctor:{id:reqData['doctorID']}})
            return responseGenerator.sendData(educationRecords)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Complete the Signup for Doctors (Education)
    async AddDoctorEducation(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["doctorID","title","place","startDate"])){
            return responseGenerator.missingParam
        }
        try{

            // Get Doctors DB Entity
            const currentDoctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            if (currentDoctor === null){
                return responseGenerator.notFound
            }         
            // Adding Doctors Educations
            var newEducation     = new DoctorEducation()
            newEducation.doctor    = currentDoctor
            newEducation.title     = reqData['title']
            newEducation.place     = reqData['place']
            newEducation.startDate = new Date(reqData['startDate'])
            newEducation.endDate   = new Date(reqData['endDate'])
            await Database.getRepository(DoctorEducation).save(newEducation)
            
            return responseGenerator.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Delete Doctor Education
    async DeleteDoctorEducation(reqData){
        if(checkUndefined(reqData,['doctorID',"recordID"])){
            return responseGenerator.missingParam
        }
        try{
            // Check Weather the Record Exist Or not
            const EduRecord = await Database.getRepository(DoctorEducation).findOneBy({id:reqData["recordID"],doctor:{id:reqData['doctorID']}})
            if(EduRecord === null){
                return responseGenerator.notFound
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

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Get Doctor Experince Records
    async GetDoctorExperinceRecords(reqData){
        if (checkUndefined(reqData,["doctorID"])){
            return responseGenerator.missingParam
        }
        try{
            // Getting the Record
            const ExperinceRecords = await Database.getRepository(DoctorExperince).findBy({doctor:{id:reqData['doctorID']}})
            return responseGenerator.sendData(ExperinceRecords)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Complete the Signup for Doctors (Experince)
    async AddDoctorExperince(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["emadoctorIDil","title","place","startDate"])){
            return responseGenerator.missingParam
        }
        try{
            // Get Doctors DB Entity
            const currentDoctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            if (currentDoctor === null){
                return responseGenerator.notFound
            }

            // Adding Doctors Experince
            var newExperince    = new DoctorExperince()
            newExperince.doctor    = currentDoctor
            newExperince.title     = reqData['title']
            newExperince.place     = reqData['place']
            newExperince.startDate = new Date(reqData['startDate'])
            newExperince.endDate   = new Date(reqData['endDate'])
            await Database.getRepository(DoctorExperince).save(newExperince)
            
            return responseGenerator.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Delete Doctor Experince
    async DeleteDoctorExperince(reqData){
        if(checkUndefined(reqData,['doctorID',"recordID"])){
            return responseGenerator.missingParam
        }
        try{

            // Check Weather the Record Exist Or not
            const ExpRecord = await Database.getRepository(DoctorExperince).findOneBy({id:reqData["recordID"],doctor:{id:reqData['doctorID']}})
            if(ExpRecord === null){
                return responseGenerator.notFound
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

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }
    
    // Get Doctor Certificate Records
    async GetDoctorCertificateRecords(reqData){
        if (checkUndefined(reqData,["doctorID"])){
            return responseGenerator.missingParam
        }
        try{
            // Getting the Record
            const CertificateRecords = await Database.getRepository(DoctorCertificate).findBy({doctor:{id:reqData['doctorID']}})
            return responseGenerator.sendData(CertificateRecords)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }
    
    // Complete the Signup for Doctors (Certificate)
    async AddDoctorCertificate(reqData){
        // Check Parameter Existance
        if (checkUndefined(reqData,["doctorID","title","place","date"])){
            return responseGenerator.missingParam
        }
        try{
            // Get Doctors DB Entity
            const currentDoctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            if (currentDoctor === null){
                return responseGenerator.notFound
            }

            // Adding Doctor Certificate
            var newCertificate     = new DoctorCertificate()
            newCertificate.doctor    = currentDoctor
            newCertificate.title     = reqData['title']
            newCertificate.place     = reqData['place']
            newCertificate.date = new Date(reqData['date'])
            await Database.getRepository(DoctorCertificate).save(newCertificate)
            
            return responseGenerator.done

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Delete Doctor Certificate
    async DeleteDoctorCertificate(reqData){
        if(checkUndefined(reqData,['doctorID',"recordID"])){
            return responseGenerator.missingParam
        }
        try{

            // Check Weather the Record Exist Or not
            const CertRecord = await Database.getRepository(DoctorCertificate).findOneBy({id:reqData["recordID"],doctor:{id:reqData['doctorID']}})
            if(CertRecord === null){
                return responseGenerator.notFound
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

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Get Doctor Tags
    async GetDoctorTags(reqData){
        if (checkUndefined(reqData,["doctorID"])){
            return responseGenerator.missingParam
        }
        try{
            // Getting the Record
            const Tags = await Database.getRepository(DoctorTag).findBy({doctor:{id:reqData['doctorID']}})
            return responseGenerator.sendData(Tags)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Add New Doctor Tag
    async AddDoctorTag(reqData){
        
        // Check if Parameters Exist
        if(checkUndefined(reqData,['doctorID',"tag"])){
            return responseGenerator.missingParam
        }
        try{
            
            // Perform Some Aditional Checks
            if (reqData['tag'] === ''){
                return responseGenerator.sendError("Tag Cannot Be Empty")
            }
            
            // if the Doctor Exceed The Tag Number Limit
            const count =  await Database.getRepository(DoctorTag).countBy({doctor:{id:reqData['doctorID']}})
            if (count >= 3 ){
                return responseGenerator.sendError('Doctor Exceeds The Maximum Number of Tags (3)')
            }

            // Check if Tag is Not Already Exist
            const checkTag = await Database.getRepository(DoctorTag).findOneBy({doctor:{id:reqData['doctorID']},tag:reqData['tag']})
            if (checkTag !== null){
                return responseGenerator.sendError("This Tag Already Exist")
            }

            // Create New Tag
            const newTag  = new DoctorTag()
            newTag.tag    = reqData['tag']
            newTag.doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})

            // Save it to The DB
            await Database.getRepository(DoctorTag).save(newTag)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Removing Doctor Tag
    async DeleteDoctorTag(reqData){

        // Check if Parameters Exist
        if(checkUndefined(reqData,['tagID',"doctorID"])){
            return responseGenerator.missingParam
        }
        try{
            // Check if Tag Even Exist
            const checkTag = await Database.getRepository(DoctorTag).findOneBy({doctor:{id:reqData['doctorID']},id:reqData['tagID']})
            if (checkTag === null){
                return responseGenerator.notFound
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

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Get Doctor Prices
    async GetDoctorPriceRanges(reqData){
        if (checkUndefined(reqData,["doctorID"])){
            return responseGenerator.missingParam
        }
        try{
            // Getting the Record
            const Prices = await Database.getRepository(Pricing).findBy({doctor:{id:reqData['doctorID']}})
            return responseGenerator.sendData(Prices)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Add New Doctor Pricings
    async AddDoctorPriceRange(reqData){
        
        // Check if Parameters Exist
        if(checkUndefined(reqData,['doctorID',"price","minutes"])){
            return responseGenerator.missingParam
        }
        try{
            
            // if the Doctor Exceed The Price Range Limit
            const count =  await Database.getRepository(Pricing).countBy({doctor:{id:reqData['doctorID']}})
            if (count >= 3 ){
                return responseGenerator.sendError('You Have Exceeds The Maximum Number of Price Ranges (3)')
            }

            // Check if Pricing for this amount of minuts is Not Already Exist
            const checkPrice = await Database.getRepository(Pricing).findOneBy({doctor:{id:reqData['doctorID']},minutesRate:reqData['minutes']})
            if (checkPrice !== null){
                return responseGenerator.sendError("You Cannot Set Two Prices for the Same Minutes")
            }

            // Create New Price Range
            const newPricing  = new Pricing()
            newPricing.minutesRate    = reqData['minutes']
            newPricing.moneyRate    = reqData['price']
            newPricing.doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})

            // Save it to The DB
            await Database.getRepository(Pricing).save(newPricing)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Removing Doctor Pricng
    async DeleteDoctorPriceRange(reqData){

        // Check if Parameters Exist
        if(checkUndefined(reqData,['priceID',"doctorID"])){
            return responseGenerator.missingParam
        }
        try{
            // Check if Price Even Exist
            const checkPrice = await Database.getRepository(Pricing).findOneBy({doctor:{id:reqData['doctorID']},id:reqData['priceID']})
            if (checkPrice === null){
                return responseGenerator.notFound
            }

            // Remove The Price From DB
            await Database
            .getRepository(Pricing)
            .createQueryBuilder('Pricing')
            .delete()
            .from(Pricing)
            .where("id = :priceID", { priceID: reqData['priceID'] })
            .andWhere("doctor.id = doctorID",{ doctorID: reqData['doctorID']})
            .execute()

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Get Doctor Available Days
    async GetDoctorAvailableTimes(reqData){
        if (checkUndefined(reqData,["doctorID"])){
            return responseGenerator.missingParam
        }
        try{
            // Getting the Record
            const days = await Database.getRepository(AvailableDays).findBy({doctor:{id:reqData['doctorID']}})

            for (var i=0;i<days.length;i++){
                days[i]['hours'] = await Database.getRepository(AvailableHour).findBy({day:{id:days[i]['id']}})
            }
            return responseGenerator.sendData(days)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }
    
    // Add New Doctor Available Time Slots
    async AddDoctorAvailableTimes(reqData){
        
        // Check if Parameters Exist
        if(checkUndefined(reqData,['doctorID',"dayName","hours"])){
            return responseGenerator.missingParam
        }
        try{
            // Check if This Day Slot is Already Exist
            const checkPrice = await Database.getRepository(AvailableDays)
            .findOneBy({
                doctor:{id:reqData['doctorID']},
                dayName:reqData['dayName'],
            })
            if (checkPrice !== null){
                return responseGenerator.sendError("This Day Slot is Already Exist")
            }

            // Create New Time
            const newDay = new AvailableDays()
            newDay.dayName    = reqData['dayName']
            newDay.doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})

            // Save The Day to The DB
            await Database.getRepository(AvailableDays).save(newDay)

            for(var hour of reqData['hours']){
                var hourSplit = hour.split(" ")
                var newHour = new AvailableHour()
                newHour.hour = hourSplit[0]
                newHour.AMPM = hourSplit[1]
                newHour.day = newDay
                await Database.getRepository(AvailableHour).save(newHour)
            }

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Removing Doctor Available Time
    async DeleteDoctorAvailableTimes(reqData){

        // Check if Parameters Exist
        if(checkUndefined(reqData,['dayID',"doctorID"])){
            return responseGenerator.missingParam
        }
        try{
            // Check if Time Slot Even Exist
            const day = await Database.getRepository(AvailableDays).findOneBy({doctor:{id:reqData['doctorID']},id:reqData['dayID']})
            if (day === null){
                return responseGenerator.notFound
            }
            // Remove All Hours Related to This Day
            await Database
            .getRepository(AvailableHour)
            .createQueryBuilder('AvailableHour')
            .delete()
            .from(AvailableHour)
            .where("day.id = :dayID", { dayID: day.id })
            .execute()

            // Remove The Day From DB
            await Database
            .getRepository(AvailableDays)
            .createQueryBuilder('AvailableDays')
            .delete()
            .from(AvailableDays)
            .where("id = :dayID", { dayID: day.id })
            .execute()

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Edit Existing Day Slot
    async EditDoctorAvailableTimes(reqData){
        // Check if Parameters Exist
        if(checkUndefined(reqData,['dayID',"doctorID","dayName","hours"])){
            return responseGenerator.missingParam
        }
        try{
            // Delete the Day
            const deleted = await this.DeleteDoctorAvailableTimes({
                "dayID":reqData['dayID'],
                "doctorID":reqData['doctorID']
            })
            if (deleted.data !== responseGenerator.done.data){
                return deleted
            }

            // Set the New Day instead of the Old one
            const newOne  =await this.AddDoctorAvailableTimes({
                "doctorID":reqData['doctorID'],
                "dayName":reqData['dayName'],
                "hours":reqData['hours']
            })
            if (newOne.data !== responseGenerator.done.data){
                return newOne
            }
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }

        return responseGenerator.done
    }

    // Getting Doctor Current Status
    async GetStatus(reqData){
        if (checkUndefined(reqData,['doctorID'])){
            return responseGenerator.missingParam
        }
        try{
            // Get Th Status From DB
            const status  = await  Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            return responseGenerator.sendData({'online':status.online})

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Set Status as Online or Offline
    async SetStatus(reqData){
        if (checkUndefined(reqData,['doctorID',"online"])){
            return responseGenerator.missingParam
        }
        try{
            // Get Doctor Info
            const doc = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})

            //Check if Not Exist
            if (doc === null){
                return responseGenerator.notFound
            }
            //change the Status
            doc.online = reqData['online']
            
            // Save Changes
            await Database.getRepository(Doctor).save(doc)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Change Doctor Language
    async ChangeDoctorLang(reqData){
        if(checkUndefined(reqData,["doctorID","language"])){
            return responseGenerator.missingParam
        }
        try{
            // Get Doctor Data
            const doc = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            
            // Check Doctor Existance
            if (doc === null){
                return responseGenerator.notFound
            }
            // Check if it is the Same Lang
            else if(doc.language === reqData['language']){
                return responseGenerator.sendError(`The User's Language is Already ${reqData['language']}`)
            }

            // Modify the Entity
            doc.language = reqData['language']
            await Database.getRepository(Doctor).save(doc)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Delete Doctor Account
    async DeleteDoctorAccount(reqData){
        if(checkUndefined(reqData,['email',"password"])){
            return responseGenerator.notFound
        }
        try{
            // Check User's Credintials
            const userLogin = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (userLogin === null){
                return responseGenerator.notFound
            }

            // check the Password Correctness
            else if (! await bcrypt.compare(reqData['password'], userLogin['password'])){
                return responseGenerator.wrongPassword
            }

            // Check if the Role is Correct
            else if (reqData['role'].toLowerCase() !== userLogin.role){
                return responseGenerator.sendError("You Are Not Authenticated")
            }
            ///// Deleteing Doctor Information

            // Remove All Hours Related to The Doctor
            await Database
            .getRepository(AvailableHour)
            .createQueryBuilder('AvailableHour')
            .delete()
            .from(AvailableHour)
            .where("doctor.id = :doctorID", { doctorID: userLogin.userID })
            .execute()


            // Remove All Days Related to The Doctor
            await Database
            .getRepository(AvailableDays)
            .createQueryBuilder('AvailableDays')
            .delete()
            .from(AvailableDays)
            .where("doctor.id = :doctorID", { doctorID: userLogin.userID })
            .execute()

            // Remove All Educational Records Related to The Doctor
            await Database
            .getRepository(DoctorEducation)
            .createQueryBuilder('DoctorEducation')
            .delete()
            .from(DoctorEducation)
            .where("doctor.id = :doctorID", { doctorID: userLogin.userID })
            .execute()

            // Remove All Experince Records Related to The Doctor
            await Database
            .getRepository(DoctorExperince)
            .createQueryBuilder('DoctorExperince')
            .delete()
            .from(DoctorExperince)
            .where("doctor.id = :doctorID", { doctorID: userLogin.userID })
            .execute()

            // Remove All Certificate Records Related to The Doctor
            await Database
            .getRepository(DoctorCertificate)
            .createQueryBuilder('DoctorCertificate')
            .delete()
            .from(DoctorCertificate)
            .where("doctor.id = :doctorID", { doctorID: userLogin.userID })
            .execute()

            // Remove All Tags Related to The Doctor
            await Database
            .getRepository(DoctorTag)
            .createQueryBuilder('DoctorTag')
            .delete()
            .from(DoctorTag)
            .where("doctor.id = :doctorID", { doctorID: userLogin.userID })
            .execute()

            // Remove All Pricings Ranges to The Doctor
            await Database
            .getRepository(Pricing)
            .createQueryBuilder('Pricing')
            .delete()
            .from(Pricing)
            .where("doctor.id = :doctorID", { doctorID: userLogin.userID })
            .execute()

            // Remove Main Info Related to The Doctor
            await Database
            .getRepository(Doctor)
            .createQueryBuilder('Doctor')
            .delete()
            .from(Doctor)
            .where("id = :doctorID", { doctorID: userLogin.userID })
            .execute()

            // Change the Account Active Status in Login Router
            userLogin.active = false
            await Database.getRepository(LoginRouter).save(userLogin)

            // Sending After-Delete Email
            SendMail(reqData['email'],"We're sorry to see you go","\
            \nYour account has been successfully deleted from our system.\
            \n\nWe would like to thank you for being a part of our community. Your feedback and interactions have been valuable, and we hope you've had a positive experience with us.\
            \nIf you have any further questions or need assistance, please don't hesitate to contact our support team at "+process.env.SYSTEM_SUPPORT_EMAIL+". We're here to help.\
            \nWishing you all the best in your future endeavors.\
            \n\n\nSincerely,\
            \nTa3afi Team\
")

            return responseGenerator.sendData("The Account is Deleted Successfully")

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }

    }


    //---------------------------------------------------------------------------------------------
    //------------------------------------- Patient Endpoints -------------------------------------
    //---------------------------------------------------------------------------------------------

    // Get Doctor Main Info
    async GetPatientMainInfo(reqData){
        if (checkUndefined(reqData,["patientID"])){
            return responseGenerator.missingParam
        }
        try{
            // Get Main Info
            const patientMain = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            if (patientMain === null){
                return responseGenerator.notFound
            }

            const getEmail = await Database.getRepository(LoginRouter).findOneBy({userID:reqData['patientID'],role:"patient"})

            patientMain['email'] = getEmail.email

            return responseGenerator.sendData(patientMain)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }

    }

    // Change Patient Name
    async changePatientName(reqData){
        if (checkUndefined(reqData,['patientID','newName'])){
            return responseGenerator.missingParam
        }
        // Get Patinet's Info
        const patient = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
        if (patient === undefined){
            return responseGenerator.notFound
        }

        // Change Patient's Name
        patient.name = reqData['newName']

        // Save Changes To DB
        await Database.getRepository(Patient).save(patient)

        return responseGenerator.done
    }

    // Change Patient BirthDate
    async changePatientBirthDate(reqData){
        if (checkUndefined(reqData,['id','newBirthDate'])){
            return responseGenerator.missingParam
        }
        // Get Patinet's Info
        const patient = await Database.getRepository(Patient).findOneBy({id:reqData['id']})
        if (patient === undefined){
            return responseGenerator.notFound
        }

        // Change Patient's Name
        patient.birthDate =new Date(reqData['newBirthDate'])

        // Save Changes To DB
        await Database.getRepository(Patient).save(patient)

        return responseGenerator.done
    }

    // Change Patient Profile Image
    async changePatientProfileImage(reqData){
        if (checkUndefined(reqData,['id','imageName'])){
            return responseGenerator.missingParam
        }
        // Get Patinet's Info
        const patient = await Database.getRepository(Patient).findOneBy({id:reqData['id']})
        if (patient === undefined){
            return responseGenerator.notFound
        }

        // Change Patient's image
        patient.profileImage = reqData['imageName']

        // Save Changes To DB
        await Database.getRepository(Patient).save(patient)

        return responseGenerator.done
    }
    
    // Get all Patient Hobbies
    async GetPatientHobbies(reqData){
        if (checkUndefined(reqData,['patientID'])){
            return responseGenerator.missingParam
        }
        try{
            // Get Hobbies List
            const hobbies = await Database.getRepository(Hobby).findBy({patient:{id:reqData['patientID']}})
            return responseGenerator.sendData(hobbies)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }
    // Add New Doctor Tag
    async AddPatientHobby(reqData){
    
        // Check if Parameters Exist
        if(checkUndefined(reqData,['patientID',"hobby"])){
            return responseGenerator.missingParam
        }
        try{
            
            // Perform Some Aditional Checks
            if (reqData['hobby'] === ''){
                return responseGenerator.sendError("Hobby Cannot Be Empty")
            }
            
            // if the User Exceed The Hobby Number Limit
            const count =  await Database.getRepository(Hobby).countBy({patient:{id:reqData['patientID']}})
            if (count >= 5 ){
                return responseGenerator.sendError('You Exceeds The Maximum Number of Hobbies (5)')
            }

            // Check if Hobby is Not Already Exist
            const checkHobby = await Database.getRepository(Hobby).findOneBy({patient:{id:reqData['patientID']},hobby:reqData['hobby']})
            if (checkHobby !== null){
                return responseGenerator.sendError("This Hobby Already Exist")
            }

            // Create New Hobby
            const newHobby  = new Hobby()
            newHobby.hobby    = reqData['hobby']
            newHobby.patient = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})

            // Save it to The DB
            await Database.getRepository(Hobby).save(newHobby)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Removing Doctor Hobby
    async DeletePatientHobby(reqData){

        // Check if Parameters Exist
        if(checkUndefined(reqData,['hobbyID',"patientID"])){
            return responseGenerator.missingParam
        }
        try{
            // Check if Hobby Even Exist
            const checkHobby = await Database.getRepository(Hobby).findOneBy({patient:{id:reqData['patientID']},id:reqData['hobbyID']})
            if (checkHobby === null){
                return responseGenerator.notFound
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

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Get All Diagnoses List
    async GetPatientDiagnoses(reqData){
        if (checkUndefined(reqData,["patientID"])){
            return responseGenerator.missingParam
        }
        try{
            const diagnoses = await Database.getRepository(Diagnose).findBy({patient:{id:reqData['patientID']}})
            return responseGenerator.sendData(diagnoses)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Patient Add New Patient Diagnose
    async AddPatientDiagnose(reqData){
        if (checkUndefined(reqData,["patientID","name","doctorName"])){
            return responseGenerator.missingParam
        }
        try{
            // Createing New Diagnose
            const newDiagnose   = new Diagnose()
            newDiagnose.name    = reqData['name']
            newDiagnose.auther  = 'patient'
            newDiagnose.patient = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            newDiagnose.date    = reqData['date'] === undefined? null:new Date(reqData['date'])
            newDiagnose.doctorName = reqData['doctorName']
            
            // Save to DB
            await Database.getRepository(Diagnose).save(newDiagnose)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    //Remove Patient Diagnose
    async DeletePatientDiagnose(reqData){
        if (checkUndefined(reqData,["patientID","diagnoseID","role"])){
            return responseGenerator.missingParam
        }
        try{
            // Check if Diagnose Exist and The User is Autherized
            const diagnose = await Database.getRepository(Diagnose).findOneBy({id:reqData['diagnoseID'],patient:{id:reqData['patientID']}})
            if (diagnose === null){
                return responseGenerator.notFound
            }else if(diagnose.auther.toLowerCase() !== reqData['role'].toLowerCase()){
                return responseGenerator.sendError("You Are Not Autherized")
            }

            // Remove The Diagnose From DB
            await Database
            .getRepository(Diagnose)
            .createQueryBuilder('Diagnose')
            .delete()
            .from(Diagnose)
            .where("id = :diagnoseID", { diagnoseID: reqData['diagnoseID'] })
            .execute()

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Get All Medicine List
    async GetPatientMedicine(reqData){
        if (checkUndefined(reqData,["patientID"])){
            return responseGenerator.missingParam
        }
        try{
            const medicine = await Database.getRepository(Medicine).findBy({patient:{id:reqData['patientID']}})
            return responseGenerator.sendData(medicine)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Patient Add New Patient Medicine
    async AddPatientMedicine(reqData){
        if (checkUndefined(reqData,["patientID","name","doctorName","freq","active"])){
            return responseGenerator.missingParam
        }
        try{
            // Createing New Medicine
            const newMedicine       = new Medicine()
            newMedicine.name        = reqData['name']
            newMedicine.auther      = 'patient'
            newMedicine.patient     = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            newMedicine.doctorName  = reqData['doctorName']
            newMedicine.freq        = reqData['freq']
            newMedicine.active      = reqData['active']
            newMedicine.startDate   = reqData['startDate'] === undefined? null:new Date(reqData['startDate'])
            newMedicine.endDate     = reqData['endDate'] === undefined? null:new Date(reqData['endDate'])

            // Save to DB
            await Database.getRepository(Diagnose).save(newMedicine)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Remove Patient Medicine
    async DeletePatientMedicine(reqData){
        if (checkUndefined(reqData,["patientID","medicineID","role"])){
            return responseGenerator.missingParam
        }
        try{
            // Check if Diagnose Exist and The User is Autherized
            const medicine = await Database.getRepository(Medicine).findOneBy({id:reqData['medicineID'],patient:reqData['patientID']})
            if (medicine === null){
                return responseGenerator.notFound
            }else if(medicine.auther.toLowerCase() !== reqData['role'].toLowerCase()){
                return responseGenerator.sendError("You Are Not Autherized")
            }

            // Remove The Diagnose From DB
            await Database
            .getRepository(Medicine)
            .createQueryBuilder('Medicine')
            .delete()
            .from(Medicine)
            .where("id = :medicineID", { medicineID: reqData['medicineID'] })
            .execute()

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Get All Prescription List
    async GetPatientPrescriptionFiles(reqData){
        if (checkUndefined(reqData,["patientID"])){
            return responseGenerator.missingParam
        }
        try{
            const medicine = await Database.getRepository(PrescriptionFile).findBy({patient:{id:reqData['patientID']}})
            return responseGenerator.sendData(medicine)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Patient Add New Patient Prescription
    async AddPatientPrescriptionFile(reqData){
        if (checkUndefined(reqData,["patientID","fileName","doctorName"])){
            return responseGenerator.missingParam
        }
        try{
            // Createing New Prescription File
            const newPrescription       = new PrescriptionFile()
            newPrescription.file        = reqData['fileName']
            newPrescription.auther      = 'patient'
            newPrescription.patient     = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            newPrescription.doctorName  = reqData['doctorName']

            // Save to DB
            await Database.getRepository(PrescriptionFile).save(newPrescription)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Remove Patient Prescription
    async DeletePatientPrescriptionFile(reqData){
        if (checkUndefined(reqData,["patientID","prescriptionID","role"])){
            return responseGenerator.missingParam
        }
        try{
            // Check if Prescription Exist and The User is Autherized
            const prescription = await Database.getRepository(PrescriptionFile).findOneBy({id:reqData['prescriptionID'],patient:{id:reqData["patientID"]}})
            if (prescription === null){
                return responseGenerator.notFound
            }else if(prescription.auther.toLowerCase() !== reqData['role'].toLowerCase()){
                return responseGenerator.sendError("You Are Not Autherized")
            }

            // Remove The Prescription From DB
            await Database
            .getRepository(PrescriptionFile)
            .createQueryBuilder('PrescriptionFile')
            .delete()
            .from(PrescriptionFile)
            .where("id = :prescriptionID", { prescriptionID: reqData['prescriptionID'] })
            .execute()

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Change Language
    async ChangePatientLang(reqData){
        if(checkUndefined(reqData,["patientID","language"])){
            return responseGenerator.missingParam
        }
        try{
            // Get Patient Data
            const patient = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            
            // Check Patient Existance
            if (patient === null){
                return responseGenerator.notFound
            }
            // Check if it is the Same Lang
            else if(patient.language === reqData['language']){
                return responseGenerator.sendError(`The User's Language is Already ${reqData['language']}`)
            }

            // Modify the Entity
            patient.language = reqData['language']
            await Database.getRepository(Patient).save(patient)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Get Patient Account Info, Like Hieght, weight, Blood Type and More
    async GetPatientAccountInfo(reqData){
        // Check Parameter Existence
        if(checkUndefined(reqData,['patientID'])){
            return responseGenerator.missingParam
        }
        try{
            // Get Patient Account Info
            const info = await Database.getRepository(PatientAccountInfo).findOneBy({patient:{id:reqData['patientID']}})
            if (info === null){
                return responseGenerator.sendError("There is an Error in Account Creation, Please re-Create The Account or Contact The Backend")
            }

            return responseGenerator.sendData(info)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Edit Patient Account Info ( Like Hieght, weight, Blood Type and More )
    async EditPatientAccountInfo(reqData){
        if(checkUndefined(reqData,["patientID"])){
            return responseGenerator.missingParam
        }
        try{
            // Get patient Account Info
            const info = await Database.getRepository(PatientAccountInfo).findOneBy({patient:{id:reqData['patientID']}})

            // Edit Provided Info
            info.height        = reqData['height']        != undefined ? reqData['height']        :null
            info.weight        = reqData['weight']        != undefined ? reqData['weight']        :null
            info.blood         = reqData['blood']         != undefined ? reqData['blood']         :null
            info.martialStatus = reqData['martialStatus'] != undefined ? reqData['martialStatus'] :null
            info.alcohol       = reqData['alcohol']       != undefined ? reqData['alcohol']       :null
            info.drugs         = reqData['drugs']         != undefined ? reqData['drugs']         :null
            info.religious     = reqData['religious']     != undefined ? reqData['religious']     :null
            info.religion      = reqData['religion']      != undefined ? reqData['religion']      :null

            // Save Changes to DB
            await Database.getRepository(PatientAccountInfo).save(info)
            
            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    //Delete Patient Account
    async DeletePatientAccount(reqData){
        if (checkUndefined(reqData,["email","password"])){
            return responseGenerator.missingParam
        }
        try{
            // Check User's Credintials
            const userLogin = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (userLogin === null){
                return responseGenerator.notFound
            }

            // check the Password Correctness
            else if (! await bcrypt.compare(reqData['password'], userLogin['password'])){
                return responseGenerator.wrongPassword
            }

            // Check if the Role is Correct
            else if (reqData['role'].toLowerCase() !== userLogin.role){
                return responseGenerator.sendError("You Are Not Authenticated")
            }

            ///// Deleteing Patient Information

            // Remove The Prescription From DB
            await Database
            .getRepository(PrescriptionFile)
            .createQueryBuilder('PrescriptionFile')
            .delete()
            .from(PrescriptionFile)
            .where("patient.id = :patientID", { patientID: userLogin.userID })
            .execute()

            // Remove The Hobbies From DB
            await Database
            .getRepository(Hobby)
            .createQueryBuilder('Hobby')
            .delete()
            .from(Hobby)
            .where("patient.id = :patientID", { patientID: userLogin.userID })
            .execute()

            // Remove The Medicine From DB
            await Database
            .getRepository(Medicine)
            .createQueryBuilder('Medicine')
            .delete()
            .from(Medicine)
            .where("patient.id = :patientID", { patientID: userLogin.userID })
            .execute()

            // Remove The Diagnose From DB
            await Database
            .getRepository(Diagnose)
            .createQueryBuilder('Diagnose')
            .delete()
            .from(Diagnose)
            .where("patient.id = :patientID", { patientID: userLogin.userID })
            .execute()

            // Change the Account Active Status in Login Router
            userLogin.active = false
            await Database.getRepository(LoginRouter).save(userLogin)

            // Sending After-Delete Email
            SendMail(reqData['email'],"We're sorry to see you go","\
            \nYour account has been successfully deleted from our system.\
            \n\nWe would like to thank you for being a part of our community. Your feedback and interactions have been valuable, and we hope you've had a positive experience with us.\
            \nIf you have any further questions or need assistance, please don't hesitate to contact our support team at "+process.env.SYSTEM_SUPPORT_EMAIL+". We're here to help.\
            \nWishing you all the best in your future endeavors.\
            \n\n\nSincerely,\
            \nTa3afi Team\
")

            return responseGenerator.sendData("The Account is Deleted Successfully")
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }
    
    
}

export default new profileEditFunctions();
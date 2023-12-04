import { Database } from "../../data-source";
import { LessThan } from 'typeorm';
import { PatientNotification } from "../../entity/PatientInfo/PatientNotification";
import { Patient } from "../../entity/users/Patient";
import responseGenerator from "../../middleFunctions/responseGenerator";
import checkUndefined from "../../middleFunctions/checkUndefined";
import { DoctorNotification } from "../../entity/DoctorInfo/DoctorNotification";
import { Doctor } from "../../entity/users/Doctor";
import dictionary from "../../middleFunctions/dictionary";
const bcrypt = require("bcrypt")

class Notification{ //Add The Count
    //-------------------------------------------------------------------------------------------
    //--------------------------------- Patient Notifications -----------------------------------
    //-------------------------------------------------------------------------------------------

    // Inner Function: Send a Notification To a Patient
    async sendPatientNotification(patientID:number,category:string,header:string,text:string){
        // Check Parameter Existence
        if (patientID === undefined || header === undefined || text === undefined || category ===undefined){
            var mis = ''
            mis+= patientID === undefined ? 'patientID ':""
            mis+= header === undefined ? 'header ':""
            mis+= text === undefined ? 'text ':""
            mis+= category === undefined ? 'category ':""
            return responseGenerator.sendMissingParam(mis)
        }
        try{
            // Get Patient Info
            const patient = await Database.getRepository(Patient).findOneBy({id:patientID})
            if (patient === null){
                return responseGenerator.notFound
            }

            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

            const LatestNotification = await Database.getRepository(PatientNotification)
                .createQueryBuilder('notification')
                .where('notification.header = :header', { header })
                .andWhere('notification.text LIKE :text', { text: `%${text}%` })
                .andWhere('notification.date > :twentyFourHoursAgo', { twentyFourHoursAgo })
                .getOne();

              // Create New Notification
              if (LatestNotification === null){
                const newNotification    = new PatientNotification()
                newNotification.date     = new Date()
                newNotification.category = dictionary[category.toLowerCase()] !== undefined ? dictionary[category.toLowerCase()][patient.language]:category    // Used to Translate all Notification Categories to User Lang
                newNotification.header   = dictionary[header.toLowerCase()] !== undefined ? dictionary[header.toLowerCase()][patient.language]: header   // Used to Translate all Notification Categories to User Lang
                newNotification.text     = text
                newNotification.patient  = patient

                await Database.getRepository(PatientNotification).save(newNotification)
              }else{
                LatestNotification.date     = new Date()
                LatestNotification.seen     = false
                LatestNotification.counter += 1
                await Database.getRepository(PatientNotification).save(LatestNotification)

            }
              return responseGenerator.done
        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Get Patient unseen Notifications Count
    async getPatientNotificationCount(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['patientID'])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            const NotificationCount = await Database.getRepository(PatientNotification).countBy({patient:{id:reqData['patientID']},seen:false})         
            return responseGenerator.sendData({"newNotifications":NotificationCount})

        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Get All Patient Notifications
    async getPatientNotificationList(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['patientID'])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            const NotificationList = await Database.getRepository(PatientNotification).find({
                where: { patient: { id: reqData['patientID'] } },
                order: { date: 'DESC' }, // Sorting by date in descending order (latest first)
              });            
            //  Mark All Notifications as Seen
            const NotificationunseenList = await Database.getRepository(PatientNotification).findBy({patient:{id:reqData['patientID']},seen:false})
            for (var n of NotificationunseenList){
                n.seen = true
                await Database.getRepository(PatientNotification).save(n)
            }

            return responseGenerator.sendData(NotificationList)
        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Remove one Patient Notification
    async removeOnePatientNotification(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['notificationID'])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Delete the Notification
            await Database.getRepository(PatientNotification)
            .createQueryBuilder('PatientNotification')
            .delete()
            .from(PatientNotification)
            .where("id = :notificationID",{notificationID : reqData['notificationID']})
            .execute()

            return responseGenerator.done

        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Clear All Patient Notification
    async ClearAllPatientNotifications(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['patientID'])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Delete the Notification List
            await Database.getRepository(PatientNotification)
            .createQueryBuilder('PatientNotification')
            .delete()
            .from(PatientNotification)
            .where("patient.id = :patientID",{patientID : reqData['patientID']})
            .execute()

            return responseGenerator.done
            
        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    //-------------------------------------------------------------------------------------------
    //--------------------------------- Doctor Notifications ------------------------------------
    //-------------------------------------------------------------------------------------------

    // Inner Function: Send a Notification To a Doctor
    async sendDoctorNotification(doctorID:number,category:string,header:string,text:string){
        // Check Parameter Existence
        if (doctorID === undefined || header === undefined || text === undefined || category ===undefined){
            var mis = ''
            mis+= doctorID === undefined ? 'doctorID ':""
            mis+= header === undefined ? 'header ':""
            mis+= text === undefined ? 'text ':""
            mis+= category === undefined ? 'category ':""
            return responseGenerator.sendMissingParam(mis)
        }
        try{
            // Get Doctor Info
            const doctor = await Database.getRepository(Doctor).findOneBy({id:doctorID})
            if (doctor === null){
                return responseGenerator.notFound
            }

            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

            const LatestNotification = await Database.getRepository(DoctorNotification)
                .createQueryBuilder('notification')
                .where('notification.header = :header', { header })
                .andWhere('notification.text LIKE :text', { text: `%${text}%` })
                .andWhere('notification.date > :twentyFourHoursAgo', { twentyFourHoursAgo })
                .getOne();

              // Create New Notification
              if (LatestNotification === null){
                const newNotification    = new DoctorNotification()
                newNotification.date     = new Date()
                newNotification.category = dictionary[category.toLowerCase()] !== undefined ? dictionary[category.toLowerCase()][doctor.language]:category    // Used to Translate all Notification Categories to User Lang
                newNotification.header   = dictionary[header.toLowerCase()] !== undefined ? dictionary[header.toLowerCase()][doctor.language]: header   // Used to Translate all Notification Categories to User Lang                newNotification.text     = text
                newNotification.doctor  = doctor

                await Database.getRepository(DoctorNotification).save(newNotification)
              }else{
                LatestNotification.date     = new Date()
                LatestNotification.seen     = false
                LatestNotification.counter += 1
                await Database.getRepository(DoctorNotification).save(LatestNotification)

            }
              return responseGenerator.done
        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Get Doctor unseen Notifications Count
    async getDoctorNotificationCount(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['doctorID'])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            const NotificationCount = await Database.getRepository(DoctorNotification).countBy({doctor:{id:reqData['doctorID']},seen:false})         
            return responseGenerator.sendData({"newNotifications":NotificationCount})

        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Get All Doctor Notifications
    async getDoctorNotificationList(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['doctorID'])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            const NotificationList = await Database.getRepository(DoctorNotification).find({
                where: { doctor: { id: reqData['doctorID'] } },
                order: { date: 'DESC' }, // Sorting by date in descending order (latest first)
              });

             //  Mark All Notifications as Seen
             const NotificationUnseenList = await Database.getRepository(DoctorNotification).findBy({doctor:{id:reqData['doctorID']},seen:false})
             for (var n of NotificationUnseenList){
                 n.seen = true
                 await Database.getRepository(DoctorNotification).save(n)
             }

            return responseGenerator.sendData(NotificationList)

        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Remove one Doctor Notification
    async removeOneDoctorNotification(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['notificationID'])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Delete the Notification
            await Database.getRepository(DoctorNotification)
            .createQueryBuilder('DoctorNotification')
            .delete()
            .from(DoctorNotification)
            .where("id = :notificationID",{notificationID : reqData['notificationID']})
            .execute()

            return responseGenerator.done

        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Remove one Doctor Notification
    async ClearAllDoctorNotifications(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['doctorID'])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Delete the Notification List
            await Database.getRepository(DoctorNotification)
            .createQueryBuilder('DoctorNotification')
            .delete()
            .from(DoctorNotification)
            .where("doctor.id = :doctorID",{doctorID : reqData['doctorID']})
            .execute()

            return responseGenerator.done
            
        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }
}



export default new Notification();
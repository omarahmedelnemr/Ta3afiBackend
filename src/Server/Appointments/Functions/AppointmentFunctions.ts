import { Database } from "../../../data-source";
import checkUndefined from "../../../Public Functions/checkUndefined";
import responseGenerator from "../../../Public Functions/responseGenerator";
import { AvailableDays } from "../../User Info/Tables/DoctorInfo/AvailableDays";
import { AvailableHour } from "../../User Info/Tables/DoctorInfo/AvailableHours";
import { DoctorCertificate } from "../../User Info/Tables/DoctorInfo/DoctorCertificate";
import { DoctorEducation } from "../../User Info/Tables/DoctorInfo/DoctorEducation";
import { DoctorExperince } from "../../User Info/Tables/DoctorInfo/DoctorExperince";
import { Pricing } from "../../User Info/Tables/DoctorInfo/Pricing";
import { DoctorReview } from "../../User Info/Tables/DoctorInfo/Reviews";
import { DoctorTag } from "../../User Info/Tables/DoctorInfo/Tags";
import { Doctor } from "../../User Info/Tables/Users/Doctor";
import { Patient } from "../../User Info/Tables/Users/Patient";
import { Appointment } from "../Tables/Appointment";
import { AppointmentNote } from "../Tables/AppointmentNote";

class AppointmentFunctions{
    // ---------------------------------------------------------------------------
    // ----------------------------- Patient Side ---------------------------------
    // ---------------------------------------------------------------------------
    // Patient View All Avaliable Doctors
    async GetAllActiveDoctors(reqData){

        try{
            // Get Active Apoointment List Related to a Patient
            const doctorsList = await Database.getRepository(Doctor).findBy({})

            // Add Doctor Tags
            for(var i=0;i<doctorsList.length;i++){
                doctorsList[i]['tags'] = await Database.getRepository(DoctorTag).findBy({doctor:{id:doctorsList[i].id}})
            }
            
            return responseGenerator.sendData(doctorsList)
        }catch(err){
            console.log("Error!",err)
            return responseGenerator.Error
        }
    }

    // Get Doctor Profile Info
    async GetDoctorProfile(reqData){
        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,['doctorID'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Getting the Record
            const doctorMain = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})

            console.log((await this.GetDoctorTags({doctorID:reqData['doctorID']})))
            // Add Doctor Sub Data
            doctorMain['tags']         =  (await this.GetDoctorTags({doctorID:reqData['doctorID']})).data
            doctorMain['certificates'] =  (await this.GetDoctorCertificateRecords({doctorID:reqData['doctorID']})).data
            doctorMain['experince']    =  (await this.GetDoctorExperinceRecords({doctorID:reqData['doctorID']})).data
            doctorMain['education']    =  (await this.GetDoctorEducationRecords({doctorID:reqData['doctorID']})).data
            doctorMain['pricing']      =  (await this.GetDoctorPriceRanges({doctorID:reqData['doctorID']})).data

            return responseGenerator.sendData(doctorMain)

        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Get Doctor Available Times
    async GetDoctorAvailableTimes(reqData){
        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,["doctorID"])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
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
    

    // Get Doctor Education Records
    async GetDoctorEducationRecords(reqData){
        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,['doctorID'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
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

    // Get Doctor Experince Records
    async GetDoctorExperinceRecords(reqData){
        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,['doctorID'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
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

    // Get Doctor Certificate Records
    async GetDoctorCertificateRecords(reqData){
        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,['doctorID'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
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

    // Get Doctor Tags
    async GetDoctorTags(reqData){
        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,['doctorID'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
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

    // Get Doctor Prices
    async GetDoctorPriceRanges(reqData){
        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,['doctorID'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
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

    // Get All The Appointments List
    async getActiveAppointmentList(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["patientID"])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Get Active Apoointment List Related to a Patient
            const appointmentList = await Database.getRepository(Appointment).createQueryBuilder("appointment")
            .innerJoinAndSelect("appointment.doctor", "doctor")
            .where("appointment.patient = :patientId", { patientId: reqData['patientID'] })
            .andWhere("appointment.status = :status", { status: "scheduled" })
            .orderBy("appointment.date", "DESC")
            .getMany();


            return responseGenerator.sendData(appointmentList)
        }catch(err){
            console.log("Error!",err)
            return responseGenerator.Error
        }
    }

    // Get All The Appointments List
    async getAppointmentHistoryList(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["patientID"])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            const appointmentList = await Database.getRepository(Appointment).createQueryBuilder("appointment")
            .innerJoinAndSelect("appointment.doctor", "doctor")
            .where("appointment.patient = :patientId", { patientId: reqData['patientID'] })
            .andWhere("appointment.status != :status", { status: "scheduled" })
            .orderBy("appointment.date", "DESC")
            .getMany();

              
            // Adding Appointments Notes
            for(var i=0;i<appointmentList.length;i++){
                appointmentList[i]['notes'] = await Database.getRepository(AppointmentNote).findBy({appointment:{id:appointmentList[i].id}})
            }

            return responseGenerator.sendData(appointmentList)
        }catch(err){
            console.log("Error!",err)
            return responseGenerator.Error
        }
    }

    // Add New Appointment
    async AddAppointment(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["patientID","doctorID","date","duration","link"])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Create New Appointment
            const newAppointment           = new Appointment()
            newAppointment.AppointmentLink = reqData['link']
            newAppointment.date            = new Date(reqData['date'])
            newAppointment.duration        = reqData['duration']
            newAppointment.patient         = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            newAppointment.doctor          = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})

            // Check User Existence
            if (newAppointment.patient === null || newAppointment.doctor === null){
                return responseGenerator.notFound
            }

            // Save It to DB
            await Database.getRepository(Appointment).save(newAppointment)

            return responseGenerator.done

        }catch(err){
            console.log("Error!",err)
            return responseGenerator.Error
        }
    }

    // Delete an Appointment
    async RemoveAppointment(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["appointmentID"])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Check appointment Existence
            const appointment = await Database.getRepository(Appointment).findOneBy({id:reqData['appointmentID']})
            if (appointment === null){
                return responseGenerator.notFound
            }

            // Delete The Notes Related to The Appointment
            await Database.getRepository(AppointmentNote)
            .createQueryBuilder('AppointmentNote')
            .delete()
            .from(AppointmentNote)
            .where("appointment.id = :appointmentID",{appointmentID : reqData['appointmentID']})
            .execute()

            // Delete The Appointment
            await Database.getRepository(Appointment)
            .createQueryBuilder('Appointment')
            .delete()
            .from(Appointment)
            .where("id = :appointmentID",{appointmentID : reqData['appointmentID']})
            .execute()

            return responseGenerator.done
            
        }catch(err){
            console.log("Error!",err)
            return responseGenerator.Error
        }
    }

    // Post a Doctor Feedback
    async postReview(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["patientID","doctorID","appointmentID","review","stars","date"])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Check if there was an Appointment to Give Access To Review
            const appointment = await Database.getRepository(Appointment).findOneBy({id:reqData['appointmentID']})
            if (appointment === null){
                return responseGenerator.sendError("There Was No Appointment Between You and The Doctor, You Can't Add Review")
            }
            
            // Create New Review
            const newReview = new DoctorReview()
            newReview.stars = reqData['stars']
            newReview.date  = new Date(reqData['date'])
            newReview.text = reqData['review']
            newReview.doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})
            newReview.patient = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})

            // Check if There is a Missing Data
            if (newReview.doctor === null || newReview.patient === null){
                return responseGenerator.notFound
            }

            // Save and Return 
            await Database.getRepository(DoctorReview).save(newReview)

            // Update Total Star Rate for The Doctor
            newReview.doctor.starRate = (newReview.doctor.starRate+Number(reqData['stars']) )/2
            await Database.getRepository(Doctor).save(newReview.doctor)

            return responseGenerator.done

        }catch(err){
            console.log("Error!",err)
            return responseGenerator.Error
        }
    }

    // Remove a Review
    async removeReview(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["reviewID"])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Check if there was an Appointment to Give Access To Review
            const review = await Database.getRepository(DoctorReview).findOneBy({id:reqData['reviewID']})
            if (review === null){
                return responseGenerator.notFound
            }
            
            // Delete The Review
            await Database.getRepository(DoctorReview)
            .createQueryBuilder('DoctorReview')
            .delete()
            .from(DoctorReview)
            .where("id = :reviewID",{reviewID : reqData['reviewID']})
            .execute()

            return responseGenerator.done

        }catch(err){
            console.log("Error!",err)
            return responseGenerator.Error
        }
    }
    // ---------------------------------------------------------------------------
    // ----------------------------- Doctor Side ---------------------------------
    // ---------------------------------------------------------------------------
    
    // Get All The Appointments List
    async getActiveAppointmentListForDoctor(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["doctorID"])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            const appointmentList = await Database.getRepository(Appointment).createQueryBuilder("appointment")
            .innerJoinAndSelect("appointment.doctor", "doctor")
            .where("appointment.doctor = :patidoctorIDentId", { doctorID: reqData['doctorID'] })
            .andWhere("appointment.status = :status", { status: "scheduled" })
            .orderBy("appointment.date", "DESC")
            .getMany();


            return responseGenerator.sendData(appointmentList)
        }catch(err){
            console.log("Error!",err)
            return responseGenerator.Error
        }
    }

    // Get All The Appointments List
    async getAppointmentHistoryListForDoctor(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["doctorID"])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Get Apoointment History List Related to a Doctor
            const appointmentList = await Database.getRepository(Appointment).createQueryBuilder("appointment")
            .innerJoinAndSelect("appointment.doctor", "doctor")
            .where("appointment.doctor = :patidoctorIDentId", { doctorID: reqData['doctorID'] })
            .andWhere("appointment.status != :status", { status: "scheduled" })
            .orderBy("appointment.date", "DESC")
            .getMany();
            
            // Adding Appointments Notes
            for(var i=0;i<appointmentList.length;i++){
                appointmentList[i]['notes'] = await Database.getRepository(AppointmentNote).findBy({appointment:{id:appointmentList[i].id}})
            }

            return responseGenerator.sendData(appointmentList)
        }catch(err){
            console.log("Error!",err)
            return responseGenerator.Error
        }
    }

    // Adding New Note
    async AddNewNote(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["appointmentID","note"])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Create New Note
            const newNote = new AppointmentNote()
            newNote.appointment = await Database.getRepository(Appointment).findOneBy({id:reqData['appointmentID']})
            newNote.note        = reqData['note']

            // Check if The Appointment Exist
            if (newNote.appointment === null){
                return responseGenerator.notFound
            }

            // Save and Return 
            await Database.getRepository(AppointmentNote).save(newNote)

            return responseGenerator.done

        }catch(err){
            console.log("Error!",err)
            return responseGenerator.Error
        }
    }

    // Remove a Note
    async RemoveNote(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["noteID"])
        if(checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Check Note Existence
            const note = await Database.getRepository(AppointmentNote).findOneBy({id:reqData['noteID']})
            if (note === null){
                return responseGenerator.notFound
            }

            // Delete the Note
            await Database.getRepository(AppointmentNote)
            .createQueryBuilder('AppointmentNote')
            .delete()
            .from(AppointmentNote)
            .where("id = :noteID",{noteID : reqData['noteID']})
            .execute()

            return responseGenerator.done
        }catch(err){
            console.log("Error!",err)
            return responseGenerator.Error
        }
    }

}

export default new AppointmentFunctions();

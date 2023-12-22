import { Database } from "../../../data-source";
import checkUndefined from "../../../Public Functions/checkUndefined";
import responseGenerater from "../../../Public Functions/responseGenerator";
import { Doctor } from "../../User Info/Tables/Users/Doctor";
import { Patient } from "../../User Info/Tables/Users/Patient";
import { Appointment } from "../Tables/Appointment";
import { AppointmentNote } from "../Tables/AppointmentNote";

class AppointmentFunctions{

    // Get All The Appointments List
    async getAllAppointmentList(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["patientID"])
        if(checkParam){
            return responseGenerater.sendMissingParam(checkParam)
        }

        try{
            // Get All Apoointment List Related to a Patient
            const appointmentList = await Database.getRepository(Appointment).findBy({patient:{id:reqData['patientID']}})

            // Adding Appointments Notes
            for(var i=0;i<appointmentList.length;i++){
                appointmentList[i]['notes'] = await Database.getRepository(AppointmentNote).findBy({appointment:{id:appointmentList[i].id}})
            }

            return responseGenerater.sendData(appointmentList)
        }catch(err){
            console.log("Error!",err)
            return responseGenerater.Error
        }
    }

    // Add New Appointment
    async AddAppointment(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["patientID","doctorID","date","duration","link"])
        if(checkParam){
            return responseGenerater.sendMissingParam(checkParam)
        }

        try{
            // Create New Appointment
            const newAppointment = new Appointment()
            newAppointment.AppointmentLink = reqData['link']
            newAppointment.date = reqData['date']
            newAppointment.duration = reqData['duration']
            newAppointment.patient = await Database.getRepository(Patient).findOneBy({id:reqData['patientID']})
            newAppointment.doctor = await Database.getRepository(Doctor).findOneBy({id:reqData['doctorID']})

            // Check User Existence
            if (newAppointment.patient === null || newAppointment.doctor === null){
                return responseGenerater.notFound
            }

            // Save It to DB
            await Database.getRepository(Appointment).save(newAppointment)

            return responseGenerater.done

        }catch(err){
            console.log("Error!",err)
            return responseGenerater.Error
        }
    }

    // Delete an Appointment
    async RemoveAppointment(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["appointmentID"])
        if(checkParam){
            return responseGenerater.sendMissingParam(checkParam)
        }

        try{
            // Check appointment Existence
            const appointment = await Database.getRepository(Appointment).findOneBy({id:reqData['appointmentID']})
            if (appointment === null){
                return responseGenerater.notFound
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

            return responseGenerater.done
            
        }catch(err){
            console.log("Error!",err)
            return responseGenerater.Error
        }
    }

    // Adding New Note
    async AddNewNote(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["appointmentID","note"])
        if(checkParam){
            return responseGenerater.sendMissingParam(checkParam)
        }

        try{
            // Create New Note
            const newNote = new AppointmentNote()
            newNote.appointment = await Database.getRepository(Appointment).findOneBy({id:reqData['appointmentID']})
            newNote.note        = reqData['note']

            // Check if The Appointment Exist
            if (newNote.appointment === null){
                return responseGenerater.notFound
            }

            // Save and Return 
            await Database.getRepository(AppointmentNote).save(newNote)

            return responseGenerater.done

        }catch(err){
            console.log("Error!",err)
            return responseGenerater.Error
        }
    }

    // Remove a Note
    async RemoveNote(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["noteID"])
        if(checkParam){
            return responseGenerater.sendMissingParam(checkParam)
        }

        try{
            // Check Note Existence
            const note = await Database.getRepository(AppointmentNote).findOneBy({id:reqData['noteID']})
            if (note === null){
                return responseGenerater.notFound
            }

            // Delete the Note
            await Database.getRepository(AppointmentNote)
            .createQueryBuilder('AppointmentNote')
            .delete()
            .from(AppointmentNote)
            .where("id = :noteID",{noteID : reqData['noteID']})
            .execute()

            return responseGenerater.done
        }catch(err){
            console.log("Error!",err)
            return responseGenerater.Error
        }
    }

}

export default new AppointmentFunctions();

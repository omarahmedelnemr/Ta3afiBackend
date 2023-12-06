import { Database } from "../../data-source";
import { ChatMessages } from "../../entity/chat/ChatMessage";
import { Chatroom } from "../../entity/chat/Chatroom";
import { Doctor } from "../../entity/users/Doctor";
import { Patient } from "../../entity/users/Patient";
import checkUndefined from "../../middleFunctions/checkUndefined";
import responseGenerator from "../../middleFunctions/responseGenerator";


class ChatFunctions{

    // Create Chatroom
    async CreateChatroom(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["doctorID","patientID"])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Check For Duplications 
            const checkDup = await Database.getRepository(Chatroom).findOneBy({doctor:{id:reqData['doctorID']},patient:{id:reqData['patientID']}})
            if (checkDup !== null){
                return responseGenerator.sendError("The Chatroom Already Exist")
            }

            // Create New DB Chatroom
            const newChatroom  = new Chatroom()
            newChatroom.doctor = await Database.getRepository(Doctor).findOneBy({id:reqData["doctorID"]})
            newChatroom.patient = await Database.getRepository(Patient).findOneBy({id:reqData["patientID"]})
            await Database.getRepository(Chatroom).save(newChatroom)

            return responseGenerator.done
        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Get All Chatrooms
    async GetAlChatrooms(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["userID","role"])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Check the Role and Return the List
            var chatroomList;
            if (reqData['role'] === 'patient'){
                chatroomList =  await Database.getRepository(Chatroom)
                .createQueryBuilder('Chatroom')
                .innerJoin("Chatroom.patient","patient")
                .innerJoinAndSelect("Chatroom.doctor","doctor")
                .where("patient.id = :userID",{userID:reqData["userID"]})
                .getMany()
            }else if (reqData['role'] === 'doctor'){
                chatroomList =  await Database.getRepository(Chatroom)
                .createQueryBuilder('Chatroom')
                .innerJoin("Chatroom.doctor","doctor")
                .innerJoinAndSelect("Chatroom.patient","patient")
                .where("doctor.id = :userID",{userID:reqData["userID"]})
                .getMany()
            }

            return responseGenerator.sendData(chatroomList)

        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Mark as Seen
    async MarkAsSeen(reqData){
        const checkParam = checkUndefined(reqData,[["chatroomID","role"]])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            //  Get All unseen Messages on the Chatroom
            const messagesList = await Database.getRepository(ChatMessages)
            .createQueryBuilder("ChatMessages")
            .where("ChatMessages.chatroom.id = :chatroomID",{chatroomID:reqData['chatroomID']})
            .andWhere("ChatMessages.seen = false")
            .andWhere("ChatMessages.senderSide != :role",{role:reqData['role']})
            .getMany()

            // Mark All Messages as Seen
            for(var message of messagesList){
                message.seen = true
                await Database.getRepository(ChatMessages).save(message)
            }
            

        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Get all Charoom Messages
    async GetAllMessages(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,["chatroomID","role"])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Check For Duplications 
            const checkDup = await Database.getRepository(Chatroom).findOneBy({id:reqData['chatroomID']})
            if (checkDup === null){
                return responseGenerator.notFound
            }

            // Get All Messages
            const messages  = await Database.getRepository(ChatMessages).findBy({chatroom:{id:reqData["chatroomID"]}})

            // Mark All The Messages on The Chatroom with other Role to be Seen 
            this.MarkAsSeen(reqData)

            return responseGenerator.sendData(messages)

        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Send Message
    async SendNewMessage(reqData){
        const checkParam = checkUndefined(reqData,['chatroomID','senderRole','text'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Create New Message
            const newMessage = new ChatMessages()
            newMessage.chatroom   = await Database.getRepository(Chatroom).findOneBy({id:reqData['chatroomID']})
            newMessage.sendDate   = new Date()
            newMessage.senderSide = reqData['senderRole']
            newMessage.text       = reqData['text']

            await Database.getRepository(ChatMessages).save(newMessage)
            
            
            return responseGenerator.done
        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Get Message Count

}

export default new ChatFunctions();

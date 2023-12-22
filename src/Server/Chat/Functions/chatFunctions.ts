import { Database } from "../../../data-source";
import { ChatMessages } from "../Tables/ChatMessage";
import { ChatPlans } from "../Tables/ChatPlans";
import { Chatroom } from "../Tables/Chatroom";
import { Doctor } from "../../User Info/Tables/Users/Doctor";
import { Patient } from "../../User Info/Tables/Users/Patient";
import checkUndefined from "../../../Public Functions/checkUndefined";
import responseGenerator from "../../../Public Functions/responseGenerator";


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
                .orderBy("Chatroom.last_update",'DESC')
                .getMany()
            }else if (reqData['role'] === 'doctor'){
                chatroomList =  await Database.getRepository(Chatroom)
                .createQueryBuilder('Chatroom')
                .innerJoin("Chatroom.doctor","doctor")
                .innerJoinAndSelect("Chatroom.patient","patient")
                .where("doctor.id = :userID",{userID:reqData["userID"]})
                .orderBy("Chatroom.last_update",'DESC')
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
            const messages  = await Database.getRepository(ChatMessages)
            .createQueryBuilder("ChatMessages")
            .innerJoin("ChatMessages.chatroom","chatroom")
            .where("chatroom.id = chatroomID",{chatroomID:reqData["chatroomID"]})
            .orderBy("ChatMessages.sendDate",'DESC')
            .getMany()

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
            const chatroom = await Database.getRepository(Chatroom).findOneBy({id:reqData['chatroomID']})

            // Check if the Patient Exceeds The Messages Quota
            if (reqData['senderRole'] === 'patient' && chatroom.quota <= 0){
                return responseGenerator.sendError("You Have Exceeded You Available Quota")
            }
            
            // Create New Message
            const newMessage = new ChatMessages()
            newMessage.chatroom   = chatroom
            newMessage.sendDate   = new Date()
            newMessage.senderSide = reqData['senderRole']
            newMessage.text       = reqData['text']

            await Database.getRepository(ChatMessages).save(newMessage)
            
            // update Chatroom last Message and Update
            chatroom.last_update  = newMessage.sendDate
            if (reqData['senderRole'] === 'doctor'){
                chatroom.last_d_message = newMessage.text.length > 30 ? newMessage.text.substring(0, 30) : newMessage.text;
            }else{
                // Decrease The Qutoa and Update the Last Text
                chatroom.quota -=1;
                chatroom.last_p_message = newMessage.text.length > 30 ? newMessage.text.substring(0, 30) : newMessage.text;

            }
            await Database.getRepository(Chatroom).save(chatroom)
            
            return responseGenerator.done
        }catch(err){
            console.log("Error!!\n",err)
            return responseGenerator.Error
        }
    }

    // Get un-read Message Count For Each ChatRoom
    async GetMessagesCount(reqData){
            // Check Parameter Existence
            const checkParam = checkUndefined(reqData,["chatroomID","role"])
            if (checkParam){
                return responseGenerator.sendMissingParam(checkParam)
            }
            try{
                // Check For Cahtroom 
                const check = await Database.getRepository(Chatroom).findOneBy({id:reqData['chatroomID']})
                if (check === null){
                    return responseGenerator.notFound
                }
    
                // Get Messages Count
                const messagesCount  = await Database.getRepository(ChatMessages)
                .createQueryBuilder("ChatMessages")
                .innerJoin("ChatMessages.chatroom","chatroom")
                .where("chatroom.id = chatroomID",{chatroomID:reqData["chatroomID"]})
                .andWhere("ChatMessages.seen = false")
                .getCount()
    
                return responseGenerator.sendData(messagesCount)
    
            }catch(err){
                console.log("Error!!\n",err)
                return responseGenerator.Error
            }
    }

    // Update the Chatroom Quota
    async RegisterInChatPlan(reqData){
        // Check Parameter Existence
        const checkParam = checkUndefined(reqData,['chatroomID','newQuota'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Get Chatroom Info
            const chatroom = await Database.getRepository(Chatroom).findOneBy({id:reqData['chatroomID']})
            if (chatroom === null){
                return responseGenerator.notFound
            }

            // update Chatroom Info
            chatroom.quota = reqData['newQuota']

            // save to DB
            await Database.getRepository(Chatroom).save(chatroom)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Get all Chat Plans
    async GetAllChatPlans(reqData){
        try{
            const plans = await Database.getRepository(ChatPlans).find()
            return responseGenerator.sendData(plans)
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }
}

export default new ChatFunctions();

import Chat from './Functions/chatFunctions'

// For SocketIO
const socketIO = require("socket.io")

function InitializeChat(io){

    io.on('connection',async (socket:any) => {
        try{
            const role =  socket.handshake.query.userRole
            const id =  socket.handshake.query.userID
            if (role === undefined || id === undefined){
                console.log("Missing Param")
                socket.disconnect();
                return;
            }
            const userName = `${role}${id}`
            console.log(`user ${userName} Connected`)
            socket.join(userName)
            socket["onlineHandle"] = userName
        }catch{
            return;
        }

        // Get All Chatrooms
        socket.on("chatrooms",async (data)=>{
            console.log("Data Recieved: ",data)
            const response = await Chat.GetAlChatrooms(data)
            if (response.status !== 200){
                console.log("Error")
                socket.emit("error","Message is Not Sent")
            }else{
                console.log("response: ",response)
                socket.emit("chatrooms",response.data)
            }
        })

        // Check if the Other Person Online
        socket.on("check_online",(data)=>{
            try{
                const role = data['role']
                const id = data['id']
                const roomID = `${role}${id}`
                const check = io.sockets.adapter.rooms.get(roomID)
                if(check){
                    socket.emit("checkOnline",true)
                }else{
                    socket.emit("checkOnline",false)
                }
            }
            catch{
            
                socket.emit("Error","hello9")
            }
        })
        // Send a Message
        socket.on("send_message",async (data)=>{
            const response =await  Chat.SendNewMessage(data)
            console.log("Socket on: sendMessage")
            if (response.status !== 200){
                console.log(response)
                socket.emit("error","Message is Not Sent")
            }else{

                var otherID;
                const chatroomInfo  =  response['data']
                if (data['senderRole'] === 'patient'){
                    otherID = 'doctor'+chatroomInfo.doctor.id
                }else{
                    otherID = 'patient' + chatroomInfo.patient.id
                }

                io.to(otherID).emit('update', "Done")
                socket.emit('update', "Done")
            }
            
        })

        // Get Messages List
        socket.on("get_messages",async (data)=>{
            const response = await Chat.GetAllMessages(data)
            console.log("Inside Get Message")
            if (response.status !== 200){
                socket.emit("Error","Getting Messages Error")
            }else{
                socket.emit("get_messages",response.data)
            }
        })

        // Release the User Room If Disconnect
        socket.on('disconnect', () => {

            // Release the User Room
            socket.leave(socket.onlineHandle)
        });



    });
}
module.exports = { InitializeChat };

import Chat from './DB_Functions/chatFunctions'

// For SocketIO
const socketIO = require("socket.io")

function InitializeChat(server){

    const io = socketIO(server,{cors:{origin:true}});
    io.on('connection',async (socket:any) => {
        console.log('A user is connected');

        // Make the User Go Online
        socket.on('go_online', (data) => {
            const userName = `${data["userRole"]}${data['userID']}`
            console.log(`user ${userName} Connected`)
            socket.join(userName)
            socket["onlineHandle"] = userName
            console.log(io.sockets.adapter.rooms)
        });

        // Get All Chatrooms
        socket.on("chatrooms",async (data)=>{
            const response = await Chat.GetAlChatrooms(data)
            if (response.status !== 200){
                socket.emit("error","Message is Not Sent")
            }else{
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
                socket.emit("error","Message is Not Sent")
            }else{

                var otherID;
                if (data['senderRole'] === 'patient'){
                    otherID = 'doctor3'
                }else{
                    otherID = 'patient2'
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

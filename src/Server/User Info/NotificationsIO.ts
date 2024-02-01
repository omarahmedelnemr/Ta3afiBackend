// Middle Functions
import { getCorsAccess } from '../../Middleware/cors'
import { Authenticate } from '../../Middleware/Auth'

//Main Modules
import Notification from './Functions/NotificationFunctions'


// // Get The Count of All Unseen Patient Notifications
// router.get("/patient-notification-count", getCorsAccess, Authenticate, async (req,res)=>{
//     const response = await  Notification.getPatientNotificationCount(req.query)
//     res.status(response['status']).json(response['data'])
// })

// // Get The List of All Patient Notifications
// router.get("/patient-notification", getCorsAccess, Authenticate, async (req,res)=>{
//     const response = await  Notification.getPatientNotificationList(req.query)
//     res.status(response['status']).json(response['data'])
// })



// // Get The Count of All Unseen Doctor Notifications
// router.get("/doctor-notification-count", getCorsAccess, Authenticate, async (req,res)=>{
//     const response = await  Notification.getDoctorNotificationCount(req.query)
//     res.status(response['status']).json(response['data'])
// })

// // Get The List of All Doctor Notifications
// router.get("/doctor-notification", getCorsAccess, Authenticate, async (req,res)=>{
//     const response = await  Notification.getDoctorNotificationList(req.query)
//     res.status(response['status']).json(response['data'])
// })

// For SocketIO
// const socketIO = require("socket.io")

function InitializeNotify(io){

    io.on('connection',async (socket:any) => {
       
        socket.on("get_all_notification",async (data)=>{
            console.log("Inside: get_all_notification, Data: ",data)
            const response = await  Notification.getPatientNotificationCount(data)
            if (response.status ===200){
                socket.emit('get_all_notification',response['data'])
            }else{
                socket.emit('error',response['data'])
            }
        })
        
        // Release the User Room If Disconnect
        socket.on('disconnect', () => {

            // Release the User Room
            socket.leave(socket.onlineHandle)
        });



    });
}
module.exports = { InitializeNotify };

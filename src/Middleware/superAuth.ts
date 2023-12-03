
var jwt = require('jsonwebtoken');

export async function Authenticate(req,res,next){
    next()

    // Commented For Testing
    // const token = req.headers['authorization']
    // const userRole = req.headers['userrole']
    // try{
    //     const jwtData = await jwt.verify(token,process.env.JWTSupersecret)

    //     if (jwtData['role'] !== userRole){
    //         res.status(401).json("unauthorized")
    //     }else{
    //         next()
    //     }
    // }catch{
    //      res.status(401).json("unauthorized")
         
    // }
}

var jwt = require('jsonwebtoken');

export async function Authenticate(req,res,next){
    next()

    // // Commented For Testing
    // const token = req.headers['authorization']
    // const userRole = req.headers['userrole']
    // try{
    //     const jwtData = await jwt.verify(token,process.env.JWTsecret)

    //     if (jwtData['role'] !== userRole){
    //         throw Error;
    //     }else{
    //         next()
    //     }
    // }catch{
    //      res.status(401).json("unauthorized")
         
    // }
}
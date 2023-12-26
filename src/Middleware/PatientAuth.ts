
var jwt = require('jsonwebtoken');

export async function PatientAuthenticate(req,res,next){
    next()

    // // Commented For Testing
    // const token = req.headers['authorization']
    // try{
    //     const jwtData = await jwt.verify(token,process.env.JWTsecret)

    //     if (jwtData['role'].toLowerCase() !== 'patient'){
    //         res.status(401).json("unauthorized")
    //     }else{
    //         next()
    //     }
    // }catch{
    //      res.status(401).json("unauthorized")
         
    // }
}
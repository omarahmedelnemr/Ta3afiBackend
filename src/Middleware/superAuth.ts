
var jwt = require('jsonwebtoken');

export async function Authenticate(req,res,next){
    next()

    // // Commented For Testing
    // const token = req.headers['authorization']
    // try{

    //     // Evaluate With Super Secret
    //     const jwtData = await jwt.verify(token,process.env.JWTSupersecret)

    //     next()
    // }catch{
    //      res.status(401).json("unauthorized")
         
    // }
}
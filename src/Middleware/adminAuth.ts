
var jwt = require('jsonwebtoken');

export async function AdminAuthenticate(req,res,next){
    // next()

    // Commented For Testing
    const token = req.headers['authorization']
    try{
        const jwtData = await jwt.verify(token,process.env.ADMIN_SECRET)

    }catch{
         res.status(401).json("unauthorized")
         
    }
}
import { Database } from "../../data-source";
import { Doctor } from "../../entity/users/Doctor";
import { LoginRouter } from "../../entity/users/LoginRouter";
import { Patient } from "../../entity/users/Patient";
import { Admin } from "../../entity/users/admin";
import CommonResponse from "../../Middleware/commonResposes";
const bcrypt = require("bcrypt")
var jwt = require('jsonwebtoken');

class GeneralFunctions{



    /////// Functions

    //Login Route
    async Login(loginData){

        // Handle Missing Param
        if (loginData['email'] === undefined || loginData['password'] === undefined){
            return CommonResponse.missingParam
        }

        // Check if the User Exist
        const User = await Database.getRepository(LoginRouter).findOneBy({email:loginData['email']})
        if (User === null){
            return CommonResponse.notFound
        }
        // Check Password Correctness
        // else if (! await bcrypt.compare(User['password'], loginData['password'])){
        else if (User['password']!== loginData['password']){
            return CommonResponse.wrongPassword
        }

        // Build The JWT and Return User's Info
        try{
            var userInfo;

            // CHeck Users Role
            if (User['role'].toLowerCase() === 'patient'){
                userInfo = await Database.getRepository(Patient).findOneBy({id:User['userID']})
            }else if (User['role'].toLowerCase() === 'doctor'){
                userInfo = await Database.getRepository(Doctor).findOneBy({id:User['userID']})
            }else if (User['role'].toLowerCase() === "admin"){
                userInfo = await Database.getRepository(Admin).findOneBy({id:User['userID']})
            }
            const JWTInfo = {
                "id":User['userID'],
                'email':User['email'],
                "password":User['password']
            }

            //Generat JWT That Last For 10 Days
            const genratedJWT = jwt.sign( JWTInfo,process.env.JWTsecret,{ expiresIn: 60 * 60 *24*10 } ) 

            // Add The MetaData
            userInfo['email'] = User['email']
            userInfo['role'] = User['role']
            userInfo['jwt'] = genratedJWT

            return CommonResponse.sendData(userInfo)
        }catch(err){
            console.log(err)
            return CommonResponse.Error
        }

    }
}

export default new GeneralFunctions();
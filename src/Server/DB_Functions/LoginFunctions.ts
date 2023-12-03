import { Database } from "../../data-source";
import { Doctor } from "../../entity/users/Doctor";
import { LoginRouter } from "../../entity/login/LoginRouter";
import { Patient } from "../../entity/users/Patient";
import { Admin } from "../../entity/users/admin";
import responseGenerator from "../../middleFunctions/responseGenerator";
import checkUndefined from "../../middleFunctions/checkUndefined";
import SendMail from "../../middleFunctions/sendMail";
import { ConfirmCode } from "../../entity/login/confirmationCode";
const bcrypt = require("bcrypt")
var jwt = require('jsonwebtoken');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const passport = require("passport")
class LoginFunctions{

    // Google OAuth
    async LoginWithGoogle(loginData){

        passport.use(new GoogleStrategy({
            clientID:     process.env.GOOGLE_CLIENT_ID,
            clientSecret:  process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://yourdomain:3000/auth/google/callback",
            passReqToCallback   : true
        },
        function(request, accessToken, refreshToken, profile, done) {
            // User.findOrCreate({ googleId: profile.id }, function (err, user) {
            // return done(err, user);
            // });
            done(null,profile)
        }
        ));
    }

    //Login Route
    async Login(loginData){

        // Check Parameter Existance
        const checkParam = checkUndefined(loginData,["email","password"])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        // Check if the User Exist
        const User = await Database.getRepository(LoginRouter).findOneBy({email:loginData['email']})
        if (User === null){
            return responseGenerator.notFound
        }
        else if(! await bcrypt.compare(loginData['password'], User['password'])){  // Check Password Correctness
            return responseGenerator.wrongPassword
        }
        else if(User.active === false){    // Check if the Account is Deleted
            return responseGenerator.sendError("This Account Was Deleted, Please Create New Account")
        }
        else if (User.confirmed === false){ // Check if the Account is Not confirmed
            return responseGenerator.sendError("Your Account is Not Verified, Please Verify it and Try Again")
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
                "role":User['role']
            }

            //Generat JWT That Last For 10 Days
            const genratedJWT = jwt.sign( JWTInfo,process.env.JWTsecret,{ expiresIn: 60 * 60 *24*10 } ) 

            // Add The MetaData
            userInfo['email'] = User['email']
            userInfo['role'] = User['role']
            userInfo['jwt'] = genratedJWT

            return responseGenerator.sendData(userInfo)
        }catch(err){
            console.log(err)
            return responseGenerator.Error
        }

    }

    // Create New Doctor Account
    async doctorSignup(reqData){
        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,['email','password',"name","birthDate","gender","title","description"])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Check if the Email Already in User
            const checkExist = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email'],active:true})
            if (checkExist !== null ){
                return responseGenerator.alreadyExist
            }
            
            // Create New Doctor Entity
            const newDoctor        = new Doctor()
            newDoctor.name         = reqData['name']
            newDoctor.title        = reqData['title']
            newDoctor.description  = reqData['description']
            newDoctor.birthDate    = new Date(reqData['birthDate'])
            newDoctor.gender       = reqData['gender']
            await Database.getRepository(Doctor).save(newDoctor)
            
            // Create New Login Route with Role Check
            const newLoginRouter     = new LoginRouter()
            newLoginRouter.email     = reqData['email']
            newLoginRouter.password  = await  bcrypt.hash(reqData['password'],10)
            newLoginRouter.active    = true
            newLoginRouter.confirmed = false
            newLoginRouter.role     = 'doctor'
            newLoginRouter.userID   = newDoctor.id
            await Database.getRepository(LoginRouter).save(newLoginRouter)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Create New Patient Account
    async patientSignup(reqData){
        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,['email','password',"name","birthDate","gender"])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Check if the Email Already in User
            const checkExist = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email'],active:true})
            if (checkExist !== null ){
                return responseGenerator.alreadyExist
            }
            
            // Create New Patient Entity
            const newPatient        = new Patient()
            newPatient.name         = reqData['name']
            newPatient.birthDate    = new Date(reqData['birthDate'])
            newPatient.gender       = reqData['gender']
            await Database.getRepository(Patient).save(newPatient)
            
            // Create New Login Route with Role Check
            const newLoginRouter     = new LoginRouter()
            newLoginRouter.email     = reqData['email']
            newLoginRouter.password  = await  bcrypt.hash(reqData['password'],10)
            newLoginRouter.active    = true
            newLoginRouter.confirmed = false
            newLoginRouter.role     = 'patient'
            newLoginRouter.userID   = newPatient.id
            await Database.getRepository(LoginRouter).save(newLoginRouter)

            return responseGenerator.done
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Re Send the Confirmation Code as a Seprated Function
    async SendConfirmCode(reqData){

        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,["email"])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            
            // Check if the Email is Having a Pre Sent Code
            const preCode = await Database.getRepository(ConfirmCode).findOneBy({email:reqData['email']})
            const fourDigitsVerficationConde = `${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}${Math.round(Math.random()*9)}`
            
            // Update the Existing Email Code
            if (preCode !== null){
                preCode.code = fourDigitsVerficationConde
                preCode.expiresIn =  new Date(new Date().getTime() + 2 * 60 * 1000);
                await Database.getRepository(ConfirmCode).save(preCode)
            }
            
            //Create the Code as New
            else{
                const newVerCode = new ConfirmCode()
                newVerCode.email = reqData['email']
                newVerCode.code  = fourDigitsVerficationConde
                newVerCode.expiresIn =  new Date(new Date().getTime() + 2 * 60 * 1000);
                await Database.getRepository(ConfirmCode).save(newVerCode)
            }

            // Send Email With the Code
            SendMail(reqData['email'],"Confirm Your Email",`Welcome To Ta3afi,\nhere is your Code to Confirm Your Email: ${fourDigitsVerficationConde}`)
            return responseGenerator.sendData("Confirmation Code Sent")
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }
    
    // Check if the Code is Correct and on Date
    async verifyCode(reqData){

        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,["email","code"])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Get the Code Info and Check if it Even Exist
            const code = await Database.getRepository(ConfirmCode).findOneBy({email:reqData['email']})
            if (code === null){
                return responseGenerator.notFound
            }

            // Check Code Expiration Date
            const currentDate = new Date()
            if (currentDate > code.expiresIn){
                return responseGenerator.sendError("Code Expired")
            }

            // Check if the Entered Code is Not Correct
            else if (code.code !== reqData['code']){
                return responseGenerator.sendError("Wrong Code")
            }
            
            // The Code is Correct
            else{
                //  Createing a Auth Token (JWT), Valid Within half an Hour
                const token = jwt.sign( {"email":reqData['email']},process.env.tokenSecret,{ expiresIn: 60 * 60 * 0.5 } ) 

                // Remove Confirmation Code from DB
                await Database
                .getRepository(ConfirmCode)
                .createQueryBuilder('ConfirmCode')
                .delete()
                .from(ConfirmCode)
                .where("email = :email", { email: reqData['email'] })
                .execute()

                return responseGenerator.sendData({"token":token})

            }
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }

    // Check if the Code is Correct and on Date
    async confirmAccount(reqData){
        const checkParam = checkUndefined(reqData,['email','token'])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }

        try{
            // Validate the Token 
            try{
                const token = await await jwt.verify(reqData['token'],process.env.tokenSecret)
                if (token['email'] !== reqData['email']){
                    throw new Error("Invalid JWT")
                }
            }catch{
                return responseGenerator.custom(405,"unAuthenticated")
            }

            // Update the Confirmed Status on Login Router
            const loginRoute = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            loginRoute.confirmed = true
            await Database.getRepository(LoginRouter).save(loginRoute)
            
            // Return to the FrontEnd
            return responseGenerator.sendData("Account Verified")
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }
    
    // Reset The Password After Authorization Check
    async forgetPassword(reqData){
        // Check Parameter Existance
        const checkParam = checkUndefined(reqData,["email",'token',"newPassword"])
        if (checkParam){
            return responseGenerator.sendMissingParam(checkParam)
        }
        try{
            // Check if the Secret Code is Authorized
            try{
                const jwtData = await jwt.verify(reqData['token'],process.env.tokenSecret)
                if (jwtData['email'] !== reqData['email']){
                    throw new Error("Invalid JWT")
                }
            }catch(err){
                return responseGenerator.custom(405,"Not Authorized")
            }

            // The Token is Ok, so Get The Login Info
            const loginInfo = await Database.getRepository(LoginRouter).findOneBy({email:reqData['email']})
            if (loginInfo === null){
                return responseGenerator.notFound
            }

            // Change the Password
            loginInfo.password = await bcrypt.hash(reqData['newPassword'],10)
            await Database.getRepository(LoginRouter).save(loginInfo)

            return responseGenerator.sendData("Password Reseted Successfully")
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }
}

export default new LoginFunctions();
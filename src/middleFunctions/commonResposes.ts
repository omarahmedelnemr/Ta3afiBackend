// Generate Responses With No Need To Hard Code Them
class GenerateResponse{
    
    // Common Responses Variable
    missingParam   = {status:406,data:"Missing Parameter"};
    notFound       = {status:404,data:"Not Found"}
    done           = {status:200,data:"Done"}
    Error          = {status:406,data:"Error While DB Connection"} 
    wrongPassword  = {status:404,data:"Wrong Password"}
    alreadyExist   = {status:406,data:"Email Already Exist"}

    // Common Responses Functions
    sendData(data){
        return {status:200,data:data}
    }
    sendError(data){
        return {status:406,data:data}
    }
    custom(status,data){
        return {status:status,data:data}
    }
}

export default new GenerateResponse();
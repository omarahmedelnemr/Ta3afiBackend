class CommonResponse{
    //Common Responses
    missingParam   = {status:406,data:"Missing Parameter"};
    notFound       = {status:404,data:"Not Found"}
    done           = {status:200,data:"Done"}
    Error          = {status:406,data:"Error While DB Connection"} 
    wrongPassword  = {status:404,data:"Wrong Password"}
    alreadyExist   = {status:406,data:"Email Already Exist"}

    sendData(data){
        return {status:200,data:data}
    }
    sendError(data){
        return {status:406,data:data}
    }
}

export default new CommonResponse();
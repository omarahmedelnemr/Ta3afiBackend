function checkUndefined(reqData,params){
    console.log(`${params[0]} in ${reqData[params[0]]}`)
    console.log("hello")
    for(var param of params){
        if (reqData[param] === undefined){
            return true
        }
    }
    return false
}

export default checkUndefined
// Check if Parameter are Defined in the Req Body or Req Query
function checkUndefined(reqData,params){

    // Iterate on all Parameters and Check if Undefined
    for(var param of params){
        if (reqData[param] === undefined){

            // Some Parameter are Undefined
            return true
        }
    }

    // All Parameters are There
    return false
}

export default checkUndefined
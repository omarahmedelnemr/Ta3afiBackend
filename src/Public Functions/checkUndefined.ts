// Check if Parameter are Defined in the Req Body or Req Query
function checkUndefined(reqData,params){
    const missing = []
    // Iterate on all Parameters and Check if Undefined
    for(var param of params){
        if (reqData[param] === undefined){
            // Add Parameter to The List
            missing.push(param)
        }
    }
    if (missing.length !== 0){
        return missing
    }

    // All Parameters are There
    return false
}

export default checkUndefined
const FrontHost = process.env.FRONT_HOST

export function getCorsAccess(req,res,next){

    // res.set('Access-Control-Allow-Origin', '37.217.219.130');
    // // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    // res.set('Access-Control-Allow-Credentials',true)
    // res.set('Access-Control-Allow-Origin',"http://web.bluelightlms.com")
    res.set('Access-Control-Allow-Credentials',true)
    next()
}

// // Payment Thing
// import axios from 'axios'
// app.get("/testPay",Authenticate,async (req:any,res:any)=>{
//     console.log("========================================")
//     console.log("================ Auth ==================")
//     console.log("========================================")
//     const authData = {
//         "api_key": "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2T1RRNU1EWTRMQ0p1WVcxbElqb2lhVzVwZEdsaGJDSjkuVzJWYThpazlQTmFLZ2JnYTRwNUVIUl9TRkE3bTRuTml5MWVOTU9WUTVrQ01LRUo5Ujl0dmJab1hRb3gtMWhnSE1NRDlranVjWGxOeTFVQ1ZOQm9yVGc="
//     }
//     // Auth
//     const authResponse = await axios.post("https://accept.paymob.com/api/auth/tokens",authData)
//     const AuthToken    = authResponse.data["token"]
//     console.log(authResponse.data)
//     console.log("Token: ",AuthToken)
//     console.log("========================================")
//     console.log("=============== Order ==================")
//     console.log("========================================")
//     // Order Reg
//     const orderData = {
//         "auth_token":  AuthToken,
//         "delivery_needed": "false",
//         "amount_cents": "1000",
//         "currency": "EGP",
//         // "merchant_order_id": 5,
//         "items": [
//           {
//               "name": "ASC1515",
//               "amount_cents": "500000",
//               "description": "Smart Watch",
//               "quantity": "1"
//           },
//           { 
//               "name": "ERT6565",
//               "amount_cents": "200000",
//               "description": "Power Bank",
//               "quantity": "1"
//           }
//           ],
//         "shipping_data": {
//           "apartment": "803", 
//           "email": "claudette09@exa.com", 
//           "floor": "42", 
//           "first_name": "Clifford", 
//           "street": "Ethan Land", 
//           "building": "8028", 
//           "phone_number": "+86(8)9135210487", 
//           "postal_code": "01898", 
//            "extra_description": "8 Ram , 128 Giga",
//           "city": "Jaskolskiburgh", 
//           "country": "CR", 
//           "last_name": "Nicolas", 
//           "state": "Utah"
//         },
//           "shipping_details": {
//               "notes" : " test",
//               "number_of_packages": 1,
//               "weight" : 1,
//               "weight_unit" : "Kilogram",
//               "length" : 1,
//               "width" :1,
//               "height" :1,
//               "contents" : "product of some sorts"
//           }
//       }
//     const orderResponse = await axios.post("https://accept.paymob.com/api/ecommerce/orders",orderData)
//     const orderID = orderResponse.data['id']
//     console.log(orderResponse.data)
//     console.log("ID: ",orderID)
//     console.log("========================================")
//     console.log("============== Payment =================")
//     console.log("========================================")


//     // Payment Key
//     const payData = {
//         "auth_token": AuthToken,
//         "amount_cents": "1000", 
//         "expiration": 3600, 
//         "order_id": orderID,
//         "billing_data": {
//           "apartment": "803", 
//           "email": "claudette09@exa.com", 
//           "floor": "42", 
//           "first_name": "Clifford", 
//           "street": "Ethan Land", 
//           "building": "8028", 
//           "phone_number": "+86(8)9135210487", 
//           "shipping_method": "PKG", 
//           "postal_code": "01898", 
//           "city": "Jaskolskiburgh", 
//           "country": "CR", 
//           "last_name": "Nicolas", 
//           "state": "Utah"
//         }, 
//         "currency": "EGP", 
//         "integration_id": 4424446,
//         "lock_order_when_paid": "false"
//       }
//     const payResponse = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys",payData)
//     const payToken    = payResponse.data['token']
//     console.log(payResponse.data)

//     console.log("========================================")
//     console.log("========================================")
//     console.log("========================================")

//     const  url = `https://accept.paymobsolutions.com/api/acceptance/iframes/811564?payment_token=${payToken}`
//     res.status(200).json(url)
    
// })

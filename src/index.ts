import { Database } from "./data-source"
import app from "./app"
require('dotenv').config()

Database.initialize().then(async () => {
    await Database.runMigrations()
    app.listen(process.env.SERVER_PORT,'0.0.0.0',()=>console.log("Server Running On Port "+process.env.SERVER_PORT+"..."))
}).catch(error => console.log(error))

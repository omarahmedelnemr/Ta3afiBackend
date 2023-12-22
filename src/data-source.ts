import "reflect-metadata"
import { DataSource } from "typeorm"

require('dotenv').config()

export const Database = new DataSource({
    type: "mysql",
    host: process.env.HOST,
    port: Number(process.env.PORT),
    username: process.env.DB_USERNAME ,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    synchronize: Boolean(Number(process.env.SYNCHRONIZE)),
    logging: Boolean(Number(process.env.LOGGING)),//Boolean(process.env.LOGGING),
    entities: [ __dirname + "/Server/**/Tables/*.ts",,__dirname + "/Server/**/Tables/**/*.ts"],
    migrations: [],
    subscribers: [],
})

import { Entity, PrimaryGeneratedColumn, Column, Unique, PrimaryColumn } from "typeorm"

@Entity()
@Unique(['email'])
export class LoginRouter{
    @PrimaryColumn()
    email:string

    @Column()
    password:string

    @Column({default:false})
    confirmed:boolean

    @Column()
    userID:number

    @Column()
    role:string
}
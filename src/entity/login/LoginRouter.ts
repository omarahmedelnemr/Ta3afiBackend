import { Entity, PrimaryGeneratedColumn, Column, Unique, PrimaryColumn } from "typeorm"

@Entity()
@Unique(['email'])
export class LoginRouter{
    @PrimaryColumn()
    email:string

    @Column()
    password:string

    @Column({default:false,comment:"Check if the Email is Confirmed"})
    confirmed:boolean

    @Column({default:false,comment:"this Descriptes if the User Completed Signing up Proccess and Information"})
    completeInfo:boolean

    @Column()
    userID:number

    @Column()
    role:string
}
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

    @Column()
    userID:number

    @Column()
    role:string

    @Column({default:true,comment:"to View Weather the Account is Active or Deleted"})
    active:boolean
}
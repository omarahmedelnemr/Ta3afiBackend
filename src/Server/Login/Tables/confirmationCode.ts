import { Entity, PrimaryGeneratedColumn, Column, Unique, PrimaryColumn } from "typeorm"

@Entity()
@Unique(['email'])
export class ConfirmCode{
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    email:string

    @Column()
    code:string

    @Column()
    expiresIn:Date
}
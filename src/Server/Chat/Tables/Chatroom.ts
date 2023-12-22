import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { Doctor } from "../../User Info/Tables/Users/Doctor"
import { Patient } from "../../User Info/Tables/Users/Patient"

@Entity()
@Unique(['id'])
export class Chatroom{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column({length:30,nullable:true,comment:'The Last Message That a Doctor Send'})
    last_d_message:string

    @Column({length:30,nullable:true,comment:'The Last Message That a Patient Send'})
    last_p_message:string

    @Column()
    last_update:Date

    @Column({default:5,comment:"The Available Amount of Message That Can Be Sent by The Patient"})
    quota: number

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    doctor:Doctor


    @ManyToOne(()=>Patient,patientID=>patientID.id)
    patient:Patient

}
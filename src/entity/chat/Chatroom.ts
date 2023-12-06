import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { Doctor } from "../users/Doctor"
import { Patient } from "../users/Patient"

@Entity()
@Unique(['id'])
export class Chatroom{
    
    @PrimaryGeneratedColumn()
    id:string

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    doctor:Doctor


    @ManyToOne(()=>Patient,patientID=>patientID.id)
    patient:Patient

}
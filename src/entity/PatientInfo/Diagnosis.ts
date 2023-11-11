import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../users/Patient"
import { Doctor } from "../users/Doctor"

@Entity()
@Unique(['id'])
export class Diagnose{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column({comment:"The Name of the Diagnose like Depression Disorder"})
    name:string

    @Column({nullable:true,comment:"The Doctor Who Set this Diagnose"})
    doctorName:string

    @Column({nullable:true,comment:"The Date of When this Diagnose Was Issued, Could Be Null"})
    date:Date

    @Column({comment:"This Column is to Identify Weather this Diagnose is Being Set on App By The Patient or By a Doctor"})
    auther:string

    
    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor

}
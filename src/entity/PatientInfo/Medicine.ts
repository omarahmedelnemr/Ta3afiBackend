import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../users/Patient"
import { Doctor } from "../users/Doctor"
import { Diagnose } from "./Diagnosis"

@Entity()
@Unique(['id'])
export class Medicine{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column({comment:"The Name of the Medicine"})
    name:string

    @Column({comment:"The Doctor Who Set this Medicine"})
    doctorName:string

    @Column({nullable:true,comment:"The Date of When this Medicine Was Issued, Could Be Null"})
    date:Date

    @Column({comment:"This Column is to Identify Weather this Medicine is Being Set on App By The Patient or By a Doctor"})
    auther:string


    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor

    @ManyToOne(()=>Diagnose,diagnoseID=>diagnoseID.id)
    @JoinColumn()
    diagnose:Diagnose    

}
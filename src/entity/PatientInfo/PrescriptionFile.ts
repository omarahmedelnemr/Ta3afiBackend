import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../users/Patient"
import { Doctor } from "../users/Doctor"

@Entity()
@Unique(['id'])
export class PrescriptionFile{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column({comment:"The Name of the File"})
    file:string

    @Column({nullable:true,comment:"The Doctor Who Set this Prescription"})
    doctorName:string

    @Column({comment:"This Column is to Identify Weather this Prescription is Being Set on App By The Patient or By a Doctor"})
    auther:string

    
    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor

}
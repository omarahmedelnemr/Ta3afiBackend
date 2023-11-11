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

    @Column({comment:"This Column is to Identify Weather this Medicine is Being Set on App By The Patient or By a Doctor"})
    auther:string
    
    @Column({comment:"how Often Should Patient Take This Medicine, like 2 times a Day"})
    freq:string

    @Column({comment:"Weather the Patient is Still Taking or Not"})
    active:boolean

    @Column()
    startDate:Date

    @Column()
    endDate:Date

    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
    
}
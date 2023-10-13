import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../users/Patient"

@Entity()
@Unique(['id'])
export class PatientSettings{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    lang:string
    
    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient
}
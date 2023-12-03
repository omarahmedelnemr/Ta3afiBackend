import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../users/Patient"

@Entity()
@Unique(['id'])
export class PatientNotification{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    header:string

    @Column()
    text:string

    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient
}
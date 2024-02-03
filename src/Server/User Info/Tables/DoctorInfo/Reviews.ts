import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../Users/Doctor"
import { Patient } from "../Users/Patient"

@Entity()
@Unique(['id'])
export class DoctorReview{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    stars:number

    @Column()
    text:string

    @Column()
    date:Date

    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
}
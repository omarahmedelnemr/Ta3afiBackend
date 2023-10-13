import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../users/Doctor"

@Entity()
@Unique(['id'])
export class PatientSettings{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    lang:string
    
    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
}
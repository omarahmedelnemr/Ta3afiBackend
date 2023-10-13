import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../users/Doctor"

@Entity()
@Unique(['id'])
export class DoctorTag{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    tag:string


    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
}
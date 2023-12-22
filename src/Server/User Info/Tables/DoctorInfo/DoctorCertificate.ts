import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../Users/Doctor"

@Entity()
@Unique(['id'])
export class DoctorCertificate{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    title:string

    @Column()
    place:string

    @Column()
    date:Date

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
}
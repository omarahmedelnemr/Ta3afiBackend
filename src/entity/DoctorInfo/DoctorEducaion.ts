import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../users/Doctor"

@Entity()
@Unique(['id'])
export class DoctorEducaion{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    title:string

    @Column()
    place:string

    @Column()
    startDate:Date

    @Column()
    endDate:Date

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
}
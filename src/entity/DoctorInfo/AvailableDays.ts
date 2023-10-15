import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../users/Doctor"

@Entity()
@Unique(['id'])
export class AvailableDays{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    dayName:string

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
}
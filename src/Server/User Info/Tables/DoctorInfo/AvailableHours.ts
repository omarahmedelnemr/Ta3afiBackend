import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../Users/Doctor"
import { AvailableDays } from "./AvailableDays"

@Entity()
@Unique(['id'])
export class AvailableHour{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    hour:string

    @Column()
    AMPM:string

    @ManyToOne(()=>AvailableDays,dayID=>dayID.id)
    @JoinColumn()
    day:AvailableDays

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
}
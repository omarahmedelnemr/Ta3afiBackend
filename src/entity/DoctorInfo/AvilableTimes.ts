import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../users/Doctor"

@Entity()
@Unique(['id'])
export class AvilableTimes{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    day:string

    @Column()
    fromHour:string

    @Column()
    toHour:Date

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
}
import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../users/Doctor"

@Entity()
@Unique(['id'])
export class Pricing{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    moneyRate:number

    @Column()
    minutesRate:number

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
}
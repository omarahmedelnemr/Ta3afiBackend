import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../users/Doctor"

@Entity()
@Unique(['id'])
export class DoctorSettings{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    lang:string

    @Column({comment:"weather Online or offline or Hidden"})
    status:string

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
}
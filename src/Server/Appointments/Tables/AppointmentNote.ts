import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Appointment } from "./Appointment"

@Entity()
@Unique(['id'])
export class AppointmentNote{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    note:string

    @ManyToOne(()=>Appointment,appointmentID=>appointmentID.id)
    @JoinColumn()
    appointment:Appointment
    
}
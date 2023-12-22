import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../../User Info/Tables/Users/Patient"
import { Doctor } from "../../User Info/Tables/Users/Doctor"

@Entity()
@Unique(['id'])
export class Appointment{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    date:Date

    @Column({comment:"The Meeting Duration in Minutes"})
    duration:number

    @Column({default:"scheduled",comment:"(e.g., scheduled, completed, canceled)"})
    status:string

    @Column({comment:"The Link of The Reserved Apoointment on the Selected API"})
    AppointmentLink: string

    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
    
}
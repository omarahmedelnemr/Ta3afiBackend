import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../Users/Patient"

@Entity()
@Unique(['id'])
export class PatientNotification{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column({default:1,comment:"Used to Avoid Duplicated Notifications, instead Count Them up and Combine Them"})
    counter:number
    
    @Column({comment:"This Categorize The Notifications, Like 'interaction' for Likes and Comments, and 'System' For System Alert"})
    category:string 

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date:Date
    
    @Column()
    header:string

    @Column()
    text:string

    @Column({default:false})
    seen:boolean

    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient
}
import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../Users/Doctor"

@Entity()
@Unique(['id'])
export class DoctorNotification{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column({default:1,comment:"Used to Avoid Duplicated Notifications, instead Count Them up and Combine Them"})
    counter:number

    @Column({comment:"This Categorize The Notifications, Like 'interaction' for Likes and Comments, and 'System' For System Alert"})
    category:string 
    
    @Column()
    date:Date
    
    @Column()
    header:string

    @Column()
    text:string

    @Column({default:false})
    seen:boolean

    @ManyToOne(()=>Doctor,DoctorID=>DoctorID.id)
    @JoinColumn()
    doctor:Doctor
}
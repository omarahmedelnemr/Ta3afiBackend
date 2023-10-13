import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn, OneToOne } from "typeorm"
import { Patient } from "../users/Patient"
import { Medicine } from "./Medicine"

@Entity()
@Unique(['id'])
export class MedicalTracker{
    
    @PrimaryGeneratedColumn()
    id:string

    // @Column({comment:"Like Medicine Name"})
    // name:string
    
    @Column()
    dayTime:string

    @Column()
    reminderFreq:number

    @Column()
    endDate:Date

    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient

    @OneToOne(()=>Medicine,medID=>medID.id)
    @JoinColumn()
    medicine:Medicine
}
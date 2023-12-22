import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../Users/Patient"

@Entity()
@Unique(['id'])
export class Hobby{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    hobby:string

    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient
}
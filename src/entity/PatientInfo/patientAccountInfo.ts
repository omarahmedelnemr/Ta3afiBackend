import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../users/Patient"

@Entity()
@Unique(['id'])
export class PatientAccountInfo{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column({nullable:true})
    height:number

    @Column({nullable:true})
    weight:number

    @Column({nullable:true})
    blood:string

    @Column({nullable:true})
    martialStatus:string

    @Column({nullable:true})
    alcohol:boolean

    @Column({nullable:true})
    drugs:boolean

    @Column({nullable:true})
    religious:boolean

    @Column({nullable:true})
    religion:string


    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient
}
import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Community } from "./Community"
import { Patient } from "../users/Patient"

@Entity()
@Unique(['id'])
export class Post{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    title:string

    @Column()
    mainText:string

    @Column()
    date:Date

    @Column({default:0})
    views:number

    @Column({default:false})
    edited:boolean

    @ManyToOne(()=>Community,communityID=>communityID.id)
    @JoinColumn()
    community:Community

    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient
}
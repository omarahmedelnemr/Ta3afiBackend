import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Community } from "./Community"
import { Patient } from "../users/Patient"

@Entity()
@Unique(['id'])
export class Post{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    mainText:string

    @Column()
    date:Date

    @Column({default:false})
    approved:boolean

    @Column({default:0})
    views:number

    @Column({default:false})
    edited:boolean

    @Column({default:null,nullable:true})
    editDate:Date

    @Column({default:false})
    hideIdentity:boolean

    @ManyToOne(()=>Community,communityID=>communityID.id)
    @JoinColumn()
    community:Community

    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient
}
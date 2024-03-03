import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Community } from "./Community"
import { Patient } from "../../User Info/Tables/Users/Patient"

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

    @Column({nullable:true})
    AI_saftyRate:number

    @Column({nullable:true})
    AI_saftyWord:string

    @Column({default:false,comment:"This Identify weather the Post is Been Deleted By Supervisors"})
    deleted:boolean

    @ManyToOne(()=>Community,communityID=>communityID.id)
    @JoinColumn()
    community:Community

    @ManyToOne(()=>Patient,patientID=>patientID.id)
    @JoinColumn()
    patient:Patient
}
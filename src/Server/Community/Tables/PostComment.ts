import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Post } from "./Post"
import { Patient } from "../../User Info/Tables/Users/Patient"

@Entity()
@Unique(['id'])
export class PostComment{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    comment:string

    @Column()
    date:Date

    @ManyToOne(()=>Post,PostID=>PostID.id)
    @JoinColumn()
    post:Post

    @ManyToOne(()=>Patient,PatientID=>PatientID.id)
    @JoinColumn()
    patient:Patient
}
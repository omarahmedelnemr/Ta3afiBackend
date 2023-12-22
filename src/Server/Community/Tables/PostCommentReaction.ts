import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Post } from "./Post"
import { PostComment } from "./PostComment"
import { Patient } from "../../User Info/Tables/Users/Patient"

@Entity()
@Unique(['id'])
export class PostCommentsReaction{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    reaction:string

    @ManyToOne(()=>PostComment,commentID=>commentID.id)
    @JoinColumn()
    comment:PostComment

    @ManyToOne(()=>Patient,PatientID=>PatientID.id)
    @JoinColumn()
    patient:Patient

    @ManyToOne(()=>Post,PostID=>PostID.id)
    @JoinColumn()
    post:Post
}
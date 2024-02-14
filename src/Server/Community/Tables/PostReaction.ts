import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../../User Info/Tables/Users/Patient"
import { Post } from "./Post"

@Entity()
@Unique(['id'])
export class PostReaction{
    
    @PrimaryGeneratedColumn()
    id:string

    // @Column()
    // reaction:string

    @ManyToOne(()=>Post,postID=>postID.id)
    @JoinColumn()
    post:Post

    @ManyToOne(()=>Patient,patinetID=>patinetID.id)
    @JoinColumn()
    patient:Patient
}
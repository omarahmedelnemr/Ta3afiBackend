import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Post } from "./Post"

@Entity()
@Unique(['id'])
export class PostImages{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column({comment:"The name That Could Be Displayed under the Image Like 'Fig. 1'"})
    name:string

    @Column()
    link: string

    @ManyToOne(()=>Post,PostID=>PostID.id)
    @JoinColumn()
    post:Post

}
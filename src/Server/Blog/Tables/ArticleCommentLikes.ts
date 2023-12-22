import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Article } from "./Article"
import { Doctor } from "../../User Info/Tables/Users/Doctor"
import { ArticleComment } from "./ArticleComment"

@Entity()
@Unique(['id'])
export class ArticleCommentsLike{
    
    @PrimaryGeneratedColumn()
    id:string



    @ManyToOne(()=>ArticleComment,commentID=>commentID.id)
    @JoinColumn()
    comment:ArticleComment

    @ManyToOne(()=>Doctor,DoctorID=>DoctorID.id)
    @JoinColumn()
    doctor:Doctor

    @ManyToOne(()=>Article,ArticleID=>ArticleID.id)
    @JoinColumn()
    article:Article
}
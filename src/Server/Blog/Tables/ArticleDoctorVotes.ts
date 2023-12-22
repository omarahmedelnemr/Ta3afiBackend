import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Article } from "./Article"
import { Doctor } from "../../User Info/Tables/Users/Doctor"

@Entity()
@Unique(['id'])
export class ArticleDoctorVotes{
    
    @PrimaryGeneratedColumn()
    id:string

    @ManyToOne(()=>Article,ArticleID=>ArticleID.id)
    @JoinColumn()
    article:Article

    @ManyToOne(()=>Doctor,DoctorID=>DoctorID.id)
    @JoinColumn()
    doctor:Doctor
}
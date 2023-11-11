import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../users/Patient"
import { Article } from "./Article"

@Entity()
@Unique(['id'])
export class ArticleVotes{
    
    @PrimaryGeneratedColumn()
    id:string

    @ManyToOne(()=>Article,ArticleID=>ArticleID.id)
    @JoinColumn()
    article:Article

    @ManyToOne(()=>Patient,patinetID=>patinetID.id)
    @JoinColumn()
    patient:Patient
}
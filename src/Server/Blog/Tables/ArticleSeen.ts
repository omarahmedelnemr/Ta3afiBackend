import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Patient } from "../../User Info/Tables/Users/Patient"
import { Article } from "./Article"

@Entity()
@Unique(['id'])
export class ArticleSeen{
    
    @PrimaryGeneratedColumn()
    id:string

    @ManyToOne(()=>Article,ArticleID=>ArticleID.id)
    @JoinColumn()
    article:Article

    @ManyToOne(()=>Patient,patinetID=>patinetID.id)
    @JoinColumn()
    patient:Patient
}
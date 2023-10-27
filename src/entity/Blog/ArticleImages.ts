import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Article } from "./Article"

@Entity()
@Unique(['id'])
export class ArticleImages{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    imageDir: string

    @ManyToOne(()=>Article,ArticleID=>ArticleID.id)
    @JoinColumn()
    article:Article

}
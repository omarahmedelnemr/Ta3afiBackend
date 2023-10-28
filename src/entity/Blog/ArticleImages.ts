import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Article } from "./Article"

@Entity()
@Unique(['id'])
export class ArticleImages{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column({comment:"The name That Could Be Displayed under the Image Like 'Fig. 1'"})
    name:string

    @Column()
    link: string

    @ManyToOne(()=>Article,ArticleID=>ArticleID.id)
    @JoinColumn()
    article:Article

}
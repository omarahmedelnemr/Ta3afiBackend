import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Doctor } from "../users/Doctor"
import { Categories } from "./Categories"

@Entity()
@Unique(['id'])
export class Article{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    title:string

    @Column({nullable:true,comment:"The image that is Displayed on the List Page or int the Post Page"})
    covorImage:string

    @Column()
    mainText:string

    @Column()
    date:Date

    @Column({default:0})
    views:number

    @ManyToOne(()=>Categories,categoryD=>categoryD.id)
    @JoinColumn()
    category:Categories

    @ManyToOne(()=>Doctor,doctorID=>doctorID.id)
    @JoinColumn()
    doctor:Doctor
}
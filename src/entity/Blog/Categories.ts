import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"

@Entity()
@Unique(['id'])
export class Categories{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    category: string

    @Column({comment:"Quick Description of what is this Category Talk About in Brief"})
    description:string


    @Column({default:false,comment:"This Confirm Weather the System Admin Approved the Category or Not"})
    approved:boolean

}
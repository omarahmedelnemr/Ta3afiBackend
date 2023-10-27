import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"

@Entity()
@Unique(['id'])
export class Categories{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    category: string

}
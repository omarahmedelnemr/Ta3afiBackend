import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Categories } from "./Categories"
import { Doctor } from "../../User Info/Tables/Users/Doctor"

@Entity()
@Unique(['id'])
export class CategorySuggester{
    @PrimaryGeneratedColumn()
    id:number
    
    @ManyToOne(()=>Categories,categoryD=>categoryD.id)
    @JoinColumn()
    category:Categories

    @ManyToOne(()=>Doctor,doctor=>doctor.id)
    @JoinColumn()
    doctor:Doctor
}
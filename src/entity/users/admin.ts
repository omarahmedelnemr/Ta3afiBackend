import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm"

@Entity()
@Unique(['id'])
export class Admin{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    age: number
}
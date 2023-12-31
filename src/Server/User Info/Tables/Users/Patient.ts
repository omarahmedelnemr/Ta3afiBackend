import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm"

@Entity()
@Unique(['id'])
export class Patient{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    birthDate: Date

    @Column({default:"default.png"})
    profileImage:string

    @Column()
    gender: string

    @Column({default:'en'})
    language:string
}
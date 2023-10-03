import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm"

@Entity()
@Unique(['id'])
export class Doctor{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    title: string

    @Column()
    location: string

    @Column()
    description:string

    @Column({comment:"The Doctor Rate Percintage to 5 Stars, like: 4.6"})
    starRate:number

    @Column({default:0,comment:"The Number of Sessions That This Doctor Made, increases Every New Session"})
    sessionsNumber:number
}
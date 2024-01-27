import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from "typeorm"
import { DoctorTag } from "../DoctorInfo/Tags"

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
    birthDate: Date

    @Column({default:"default.png"})
    profileImage:string

    @Column()
    gender: string

    @Column()
    description:string

    @Column({default:'en'})
    language:string

    @Column({default:true})
    online:boolean

    @Column({default:0,comment:"The Doctor Rate Percintage to 5 Stars, like: 4.6"})
    starRate:number

    @Column({default:0,comment:"The Number of Sessions That This Doctor Made, increases Every New Session"})
    completedSessions:number

    @Column({default:0,comment:"The Number of Sessions That Active For The Doctr and Not Yet Done"})
    pendingSessions:number

}
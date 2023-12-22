import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm"

@Entity()
@Unique(['id'])
export class Supervisor{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    birthDate: Date

    @Column({default:'en'})
    language:string

    @Column()
    gender:string

    @Column({comment:"Used to Add Auth Layer to Supervisor To use It in More Secure Operations Like Delete a Post"})
    passcode:string

    @Column({default:"default.png"})
    profileImage:string

    @Column()
    role:string
}
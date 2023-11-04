import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"

@Entity()
@Unique(['id'])
export class Community{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    name: string

    @Column({comment:"Quick Description of what is this Community Talk About in Brief"})
    description:string


    @Column({default:false,comment:"This Confirm Weather the System Admin Approved this Community or Not"})
    approved:boolean

}
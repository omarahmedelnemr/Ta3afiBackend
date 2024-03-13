import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn, OneToMany } from "typeorm"

@Entity()
@Unique(['id'])
export class ChatPlans{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    price:number

    @Column()
    currency:string

    @Column({comment:"The Available Amount of Message in This Plan That Can Be Sent by The Patient"})
    amount:number
}
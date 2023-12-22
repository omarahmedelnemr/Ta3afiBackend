import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from "typeorm"
import { Chatroom } from "./Chatroom"

@Entity()
@Unique(['id'])
export class ChatMessages{
    
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    text: string

    @Column()
    sendDate: Date
    
    @Column()
    senderSide:string

    @Column({default:false})
    seen: boolean

    @ManyToOne(()=>Chatroom,chatroomID =>chatroomID.id)
    chatroom:Chatroom

}
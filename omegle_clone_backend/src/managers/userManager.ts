import { Socket } from "socket.io"
import { RoomManager } from "./roomManager";

export interface User {
    name:string,
    socket:Socket,
}

export class UserManager{
    private users: User[];
    private queue: String[];
    private roomManager :RoomManager;
    constructor(){
        this.users=[]
        this.queue=[]
        this.roomManager=new RoomManager();
    }
    addUser(name:string ,socket:Socket){
        this.users.push({
                name,socket
            })
        this.queue.push(socket.id)
        this.matchUsers()
        this.initHandlers(socket)
    }
    removeUser(socketID:string){
        const user =this.users.find((x)=>x.socket.id === socketID)
        if(user)
        {
            this.users=this.users.filter((x)=>x.socket.id !== socketID)
            this.queue=this.queue.filter((x)=>x!== socketID)
            const roompeer =this.roomManager.removeUserRoom(user)
            if(roompeer){
                roompeer.socket.emit("peer-disconnected")
                this.queue.push(roompeer.socket.id)
            }
            this.matchUsers();
            console.log(this.queue)
        }
    }
    onNext(roomId:string,socketId:string){
        const room = this.roomManager.getRoom(roomId);
        if(room)
        {
            
            const user1=room.user1;
            const user2=room.user2;
            if(this.queue.length===0) {
                user1.socket.emit("loop-next");
                user2.socket.emit("loop-next");
                return;
            }
            if(user1.socket.id === socketId){
                user2.socket.emit("peer-disconnected")
            }
            if(user2.socket.id === socketId){
                user1.socket.emit("peer-disconnected")
            }
            this.queue.unshift(user2.socket.id)
            this.queue.push(user1.socket.id)
            this.roomManager.deleteRoom(roomId)
            
            this.matchUsers()
        }
    }
    matchUsers(){
        
        if(this.queue.length < 2) return;
        
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        
        const user1= this.users.find((x)=>x.socket.id===id1)
        const user2= this.users.find((x)=>x.socket.id===id2)
        
        if(!user1 || !user2) return
        console.log("matching users",user1.name,user2.name)
        this.roomManager.createRoom(user1,user2)
        this.matchUsers();
    }
    initHandlers(socket:Socket){
        socket.on("offer",({roomId,sdp})=>{
            this.roomManager.onOffer(roomId,sdp)
        })
        socket.on("answer",({roomId,sdp})=>{
            this.roomManager.onAnswer(roomId,sdp)
        })
        socket.on("candidateForUser1",({roomId,candidate})=>{
            this.roomManager.onCandidateForUser1(roomId,candidate)
        })
        socket.on("candidateForUser2",({roomId,candidate})=>{
            this.roomManager.onCandidateForUser2(roomId,candidate)
        })
        socket.on("next",({roomId})=>{

            this.onNext(roomId,socket.id);
        })
        socket.on("message",({message})=>{
            console.log("message recieved:",message)
            this.roomManager.onMessage(message);
        })
    }
}
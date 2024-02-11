import { User } from "./userManager";
let GLOBAL_ROOM_ID =1;
interface Room{
    user1:User,
    user2:User,
    chatbox :Message[]
}
interface Message {
    roomId:number,
    data:string,
    senderName:string
}
export class RoomManager{
    private rooms: Map<string,Room>
    
    constructor(){
        this.rooms=new Map<string,Room>()
    }
    getRoom(roomId:string){
        const room =this.rooms.get(roomId)
        return room;
    }
    removeUserRoom(user:User){
        let _roompeer;
        for(let [roomId,room] of this.rooms)
        {
            if(user.socket.id === room.user1.socket.id )
            {
                _roompeer=room.user2;
                this.deleteRoom(roomId)
            }
            else if(user.socket.id === room.user2.socket.id)
            {
                _roompeer=room.user1;
                this.deleteRoom(roomId)
            }
        }
        return _roompeer;
    }
    createRoom(user1:User, user2:User){
        
        const roomId = this.generateRoomId().toString(); 
        this.rooms.set(roomId,{
            user1,
            user2,
            chatbox:[]
        })

        user1.socket.emit("send-offer",{
            roomId
        })
    }
    
    deleteRoom(roomId:string){
        this.rooms.delete(roomId);
    }
    
    onOffer(roomId:string,sdp:string){
        const user2 = this.rooms.get(roomId)?.user2;
        user2?.socket.emit("offer",{
            roomId,
            sdp
            
        })
    }

    onAnswer(roomId:string,sdp:string){
        const user1 = this.rooms.get(roomId)?.user1;
        user1?.socket.emit("answer",{
            roomId,
            sdp
            
        })
    }

    onCandidateForUser1(roomId:string,candidate:string){
        const user1 = this.rooms.get(roomId)?.user1;
        user1?.socket.emit("candidateForUser1",{
            candidate,
            roomId
        })
    }
    onCandidateForUser2(roomId:string,candidate:string){
        const user2 = this.rooms.get(roomId)?.user2;
        user2?.socket.emit("candidateForUser2",{
            candidate,
            roomId
        })
    }
    onMessage(message:Message){
        const room = this.rooms.get(message.roomId.toString());
        if(room) 
        {
            room.chatbox.push(message);
            const {user1,user2} = room;
            user1?.socket.emit("update-chatbox",{
                chatbox:room.chatbox
            })
            user2?.socket.emit("update-chatbox",{
                chatbox:room.chatbox
            })
        }
    }
    generateRoomId(){
        return GLOBAL_ROOM_ID++;
    }
}
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import ChatBox from "./ChatBox";
import Navbar from "./Navbar";
export interface Message {
    roomId:number,
    data:string,
    senderName:string
}
const servers = {
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']
        }
    ]
}

const nonHideElementStyle: CSSProperties = {
    position: 'static',
    left: 'auto'
  };
  
  const hideElementStyle: CSSProperties = {
    position: 'absolute',
    left: '-9999px'
  };
  
const URL="omegle-clone-backend-c7pt.onrender.com"
const Room = ({
        name,
        localMediaStream,
        setJoined,
    }:{
        name:string,
        localMediaStream:MediaStream|null,
        setJoined:React.Dispatch<React.SetStateAction<boolean>>
    }) => {
    
    const [incall,setIncall]=useState(false)
    const [roomId,setRoomId]=useState<number>(-1)
    const [newMessage,setNewMessage]=useState<Message>({roomId:-1,data:"",senderName:""})
    const [socket,setSocket]=useState<Socket>()
    const [chatbox,setChatbox]=useState<Message[]>([])
    const [peerConnection] =useState<RTCPeerConnection>(new RTCPeerConnection(servers));
    const addedTracks = new Set();
    const [remoteMediaStream]=useState<MediaStream>(new MediaStream())
    const remoteVideoRef=useRef<HTMLVideoElement>(null);
    const localVideoRef =useRef<HTMLVideoElement>(null);
    const setLocalVideo =()=>{
        if(localVideoRef && localVideoRef.current)
            localVideoRef.current.srcObject=localMediaStream;
        if(remoteVideoRef && remoteVideoRef.current)
            remoteVideoRef.current.srcObject=remoteMediaStream;
        else {
            console.log(remoteMediaStream,remoteVideoRef)
        }
    }
    
    const initSocket = ()=>{
        return new Promise<void>(async(resolve, reject)=>{
            try{
                const _socket = io(URL,{
                    query:{
                        name
                    }
                })
                if(_socket)
                {
                    _socket.on('connect',async()=>{
                        console.log(_socket)
                        _socket.on('send-offer',async ({roomId})=>{
                            
                            setRoomId(roomId)
                            console.log("socket before initPeerconnection",_socket)
                            if(localMediaStream && _socket) 
                            {
                                console.log("initializing peerconnection...")
                                if(remoteVideoRef && remoteVideoRef.current)
                                    remoteVideoRef.current.srcObject = remoteMediaStream;
                                else console.log("eorr is here" ,remoteMediaStream,remoteVideoRef)
                                if (!(peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed')) {
                                    localMediaStream.getTracks().forEach(track=>{
                                        if (!addedTracks.has(track.id)) {
                                            peerConnection.addTrack(track, localMediaStream);
                                            addedTracks.add(track.id);
                                        }
                                    })
                                } 
                                
                                peerConnection.addEventListener("signalingstatechange", (event) => {
                                    console.log(event);
                                    console.log(peerConnection.signalingState)
                                });
                                peerConnection.addEventListener('icecandidate',e=>{
                                    console.log('........Ice candidate found!......')
                                    console.log(e)
                                    if(e.candidate)
                                    {
                                        console.log("sending candidates for user1...")
                                        _socket.emit("candidateForUser2",{
                                            roomId,
                                            candidate:e.candidate,                        
                                        })
                                    }
                                })
                                peerConnection.addEventListener('track',e=>{
                                    console.log("Got a track from the other peer!! How excting")
                                    console.log(e)
                                    e.streams[0].getTracks().forEach(track=>{
                                        remoteMediaStream.addTrack(track);
                                        console.log("Here's an exciting moment... fingers cross")
                                    })
                                })
                            }
                            else{
                                console.log("eoeoroe is herw")
                                console.log("Initializing peer connection failed.")
                            }
                            console.log("creating offer ...")
                            const offer = await peerConnection.createOffer();
                            console.log(offer);
                            await peerConnection.setLocalDescription(offer);
                            _socket.emit("offer",{
                                roomId,
                                sdp:offer
                            })
                        })
                        _socket.on('offer',async({roomId,sdp})=>{
                            
                            setRoomId(roomId)
                            if(localMediaStream && _socket)
                            {
                                if(remoteVideoRef && remoteVideoRef.current)
                                    remoteVideoRef.current.srcObject = remoteMediaStream;
                                else console.log("error is here")
                                if (!(peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed')) {
                                    localMediaStream.getTracks().forEach(track=>{
                                        if (!addedTracks.has(track.id)) {
                                            peerConnection.addTrack(track, localMediaStream);
                                            addedTracks.add(track.id);
                                        }
                                    })
                                } 
                                peerConnection.addEventListener("signalingstatechange", (event) => {
                                    console.log(event);
                                    console.log(peerConnection.signalingState)
                                });
                                peerConnection.addEventListener('icecandidate',e=>{
                                    console.log('........Ice candidate found!......')
                                    console.log(e)
                                    if(e.candidate)
                                    {
                                        console.log("sending candidates for user1...")
                                        _socket.emit("candidateForUser1",{
                                            roomId,
                                            candidate:e.candidate,                        
                                        })
                                    }
                                })
                                peerConnection.addEventListener('track',e=>{
                                    console.log("Got a track from the other peer!! How excting")
                                    console.log(e)
                                    e.streams[0].getTracks().forEach(track=>{
                                        remoteMediaStream.addTrack(track);
                                        console.log("Here's an exciting moment... fingers cross")
                                    })
                                })
                                resolve();
                            }
                            else{
                                reject("Initializing peer connection failed.")
                            }
                            await peerConnection.setRemoteDescription(sdp);  
                            let answer = await peerConnection.createAnswer();
                            await  peerConnection.setLocalDescription(answer)
                            console.log(answer)
                            _socket.emit("answer",{
                                roomId,
                                sdp:answer
                            })
                            setIncall(true)
                            console.log("set in call from on offer")
                        })
                        _socket.on('candidateForUser1',async ({roomId,candidate})=>{
                            await peerConnection.addIceCandidate(candidate)
                            console.log("roomID:",roomId)
                            console.log("======Added Ice Candidate for user 1======")
                            console.log("candidate:",candidate)      
                        })
                        _socket.on('candidateForUser2',async ({roomId,candidate})=>{
                            console.log("roomID:",roomId)    
                            await peerConnection.addIceCandidate(candidate)
                            console.log("======Added Ice Candidate for user 2======")
                            console.log("candidate:",candidate)      
                        })
                        _socket.on('answer', async ({roomId,sdp})=>{
                            console.log("roomID:",roomId)
                            if(remoteVideoRef && remoteVideoRef.current)
                                remoteVideoRef.current.srcObject = remoteMediaStream;
                            else console.log("error is here")
                            console.log("on answer called")
                            await peerConnection?.setRemoteDescription(sdp)
                            setIncall(true)
                            console.log("set in call from on answe")
                        })
                        _socket.on('peer-disconnected',()=>{
                            console.log("peer disconnected called")
                            setIncall(false) 
                            setChatbox([])
                            remoteMediaStream.getTracks().forEach((track)=>{
                                remoteMediaStream.removeTrack(track);
                            })
                        })
                        _socket.on('loop-next',()=>{
                            setIncall(false)
                            setChatbox([]);
                            setIncall(true)
                        })
                        _socket.on('update-chatbox',({chatbox})=>{
                            
                            console.log(chatbox)
                            setChatbox(chatbox)
                        })
                        setSocket(_socket)
                    })
                    resolve();
                }
                else{
                    console.log("_socket isnt defined")
                    reject("Initializing _socket failed.")
                }
            }catch(err)
            {
                console.log(err)
                reject(err)
            }
        })
    }
    const sendMessage=()=>{
        if(socket)
        {
            socket.emit('message',{
                message:newMessage
            })
            newMessage.data=""
        }
        else{
            console.log("socket wasn't defined at the tiime of sending message")
        }
    }
    useEffect(()=>{
        const init = async()=>{
        try{
            setLocalVideo();
            await initSocket();
        }catch(err)
        {
            console.log(err)
        }
        }
        init()
    },[])
    
    return (
        <div>
        
            <Navbar></Navbar>
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 col-sm-12 " style={{position : "relative"}}>
                        <video autoPlay playsInline ref={localVideoRef} height={'auto'} width={400} ></video>
                        <video
                            style={incall ? nonHideElementStyle : hideElementStyle}
                            autoPlay
                            playsInline
                            ref={remoteVideoRef}
                            height={'auto'}
                            width={400}
                            ></video>
                        <div style={incall ? hideElementStyle : nonHideElementStyle}> Waiting to connect you to someone</div>                  
                    </div>
                    <div className="col-lg-6 col-sm-12 ">
                        <div style={incall ? nonHideElementStyle : hideElementStyle}>   
                            <div className="card">
                                <div className="card-body">
                                    <div className="chatbox mt-3">
                                        <ChatBox chatbox={chatbox} />
                                    </div>
                                    <div className="input-group mt-3">
                                        <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Type your message..."
                                        value={newMessage.data}
                                        onChange={(e) => {
                                            setNewMessage({
                                            roomId,
                                            data: e.target.value,
                                            senderName: name,
                                            });
                                        }}
                                        />
                                        <div className="input-group-append">
                                            <button className="btn btn-success" onClick={() => sendMessage()}>
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between mt-3">
                                        <button className="btn btn-danger" onClick={() => {
                                            socket?.disconnect();
                                            setJoined(false);
                                            }}>END CALL
                                        </button>
                                        <button className="btn btn-primary" onClick={() => {
                                            socket?.emit("next", { roomId });
                                            setIncall(false);
                                            setChatbox([]);
                                            }}>NEXT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    )
}

export default Room
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
const servers = {
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']
        }
    ]
}
const URL="ws://0.0.0.0:3001"

const Room1 = ({
        name,
        localMediaStream
      }:{
        name:string,
        localMediaStream:MediaStream|null
        }) =>
{
    const [lobby,setLobby] =useState(true);    
    const remoteVideoRef=useRef<HTMLVideoElement>(null);
    const localVideoRef =useRef<HTMLVideoElement>(null);
    // const initPeerConnection =()=>{
    //     return new Promise<void>(async(resolve, reject)=>{
    //         try{
    //             console.log("socket before initPeerconnection",socket)

    //             if(localMediaStream && socket) 
    //             {
    //                 console.log("initializing peerconnection...")
    //                 if(remoteVideoRef && remoteVideoRef.current)
    //                 remoteVideoRef.current.srcObject = remoteMediaStream;
    //                 else console.log("eorr is here")
    //                 localMediaStream.getTracks().forEach(track=>{
    //                     peerConnection.addTrack(track,localMediaStream);
    //                 })
    //                 peerConnection.addEventListener("signalingstatechange", (event) => {
    //                     console.log(event);
    //                     console.log(peerConnection.signalingState)
    //                 });
    //                 peerConnection.addEventListener('icecandidate',e=>{
    //                     console.log('........Ice candidate found!......')
    //                     console.log(e)
    //                     if(e.candidate)
    //                     {
    //                         console.log("sending candidates for user1...")
    //                         socket.emit("candidateForUser2",{
    //                             roomId,
    //                             candidate:e.candidate,                        
    //                         })
    //                     }
    //                 })
    //                 peerConnection.addEventListener('track',e=>{
    //                     console.log("Got a track from the other peer!! How excting")
    //                     console.log(e)
    //                     e.streams[0].getTracks().forEach(track=>{
    //                         remoteMediaStream.addTrack(track);
    //                         console.log("Here's an exciting moment... fingers cross")
    //                     })
    //                 })
    //                 resolve();
    //             }
    //             else{
    //                 console.log("eoeoroe is herw")
    //                 reject("Initializing peer connection failed.")
    //             }
    //         }catch(err)
    //         {
    //             reject(err)
    //         }
    //     })
    // }
    
    // const initPeerConnection2 =()=>{
    //     return new Promise<void>(async(resolve, reject)=>{
    //         try{
    //             if(localMediaStream && socket)
    //             {
    //                 if(remoteVideoRef && remoteVideoRef.current)
    //                 remoteVideoRef.current.srcObject = remoteMediaStream;
    //                 localMediaStream.getTracks().forEach(track=>{
    //                     peerConnection.addTrack(track,localMediaStream);
    //                 })
    //                 peerConnection.addEventListener("signalingstatechange", (event) => {
    //                     console.log(event);
    //                     console.log(peerConnection.signalingState)
    //                 });
    //                 peerConnection.addEventListener('icecandidate',e=>{
    //                     console.log('........Ice candidate found!......')
    //                     console.log(e)
    //                     if(e.candidate)
    //                     {
    //                         console.log("sending candidates for user1...")
    //                         socket.emit("candidateForUser1",{
    //                             roomId,
    //                             candidate:e.candidate,                        
    //                         })
    //                     }
    //                 })
    //                 peerConnection.addEventListener('track',e=>{
    //                     console.log("Got a track from the other peer!! How excting")
    //                     console.log(e)
    //                     e.streams[0].getTracks().forEach(track=>{
    //                         remoteMediaStream.addTrack(track);
    //                         console.log("Here's an exciting moment... fingers cross")
    //                     })
    //                 })
    //                 resolve();
    //             }
    //             else{
    //                 reject("Initializing peer connection failed.")
    //             }
    //         }catch(err)
    //         {
    //             reject(err)
    //         }
    //     })
    // }
    useEffect(()=>{
        if(localVideoRef && localVideoRef.current)
            localVideoRef.current.srcObject=localMediaStream;
        const stream =new MediaStream()
        if(remoteVideoRef && remoteVideoRef.current)
            remoteVideoRef.current.srcObject=stream;
    },[])
    return (
            <div>
                {lobby && <> Waiting to connect you to someone {name}</>}
                <video autoPlay playsInline ref={localVideoRef} height={400} width={400} ></video>
                {!lobby && <video autoPlay playsInline ref={remoteVideoRef} height={400} width={400} ></video>}
            </div>
    )
            
}

export default Room1
import { useEffect, useRef, useState } from "react"
import Room from "./Room";
import Room2 from "./Room2";
import Navbar from "./Navbar";

const Root = () => {
    const [name,setName]=useState("");
    const [joined,setJoined]=useState(false)
    const videoRef =useRef<HTMLVideoElement>(null);
    const [localMediaStream,setLocalMediaStream]=useState<MediaStream| null>(null)
    
    const getUserMedia = ()=>{
      return new Promise(async(resolve, reject)=>{
          try{
              const stream = await navigator.mediaDevices.getUserMedia({
                  video: true,
                  audio: false,
              });
              if (videoRef.current) {
                videoRef.current.srcObject = stream
              }
              setLocalMediaStream(stream)  
              resolve(stream);    
          }catch(err){
              reject(err)
          }
      })
  }
  useEffect(() => {
      const init = async () => {
        try{
          await getUserMedia();
        }catch(err){
          console.log(err)
        }
      };
      init();
  }, [videoRef,joined]);

  if(!joined)
  return (
      <div className="set-your-hair-screen">
        <Navbar></Navbar>
        <div className="container">
            <div className="row">
                <div className="col-lg-6 col-sm-12 mt-5">
                    <h2>CHECK YOU HAIR</h2>
                    <video autoPlay playsInline ref={videoRef} height={400} width={400} ></video>
                </div>
                <div className="col-lg-6 col-sm-12 mt-5">
                    <h4>Welcome! <br/></h4>
                    <p className="welcome-para text-muted">
                        This is a clone of omegle a famous video chat web using webRTC. You can join the lobby of random people by clicking join below after entering name .
                    </p>
                    <div className="d-inline-flex">
                        <input type="text" className="form-control" placeholder="Name" onChange={(e) => {
                            setName(e.target.value)
                        }} />
                        <button type="button" className="btn btn-primary" onClick={() => {
                            setJoined(true)
                        }}>
                            Join
                        </button>
                    </div>
                </div>
            </div>
            </div>
        
        
      </div>
    );
return(
    <>
    <Room2
    ></Room2>
    </>
    
)
return(
    <>
    <Room
        name={name}
        localMediaStream={localMediaStream}
        setJoined={setJoined}
    ></Room>
    </>
    
)
}

export default Root
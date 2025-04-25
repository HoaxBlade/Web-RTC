import React, {useEffect, useCallback, useState} from "react";
import { useSocket } from "../context/SocketProvider";
import peer from "../service/peer";
import ReactPlayer from "react-player";

const RoomPage = () => {

    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    

    const handleUserJoined = useCallback(({ name, id }) => {
        console.log(`User "${name}" joined with ID: ${id}`);
        setRemoteSocketId(id);

    }, []);

    const handleCallUser = useCallback(async() => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
        
        setMyStream(stream);
    }, [remoteSocketId, socket]); 

    const handleIncomingCall = useCallback(async({ from, offer }) => {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMyStream(stream);
        console.log(`Incoming call from ${from}`, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', { to: from, ans });
    }, [socket]);

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
          peer.peer.addTrack(track, myStream);
        }
      }, [myStream]);

    const handleCallAccepted = useCallback(async({ from, ans }) => {
        peer.setLocalDescription(ans);
        console.log(`Call accepted from ${from}`, ans);
        sendStreams();
    }, [sendStreams]);

    const handleNegotiationNeeded = useCallback(async() => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegotiationNeeded);
        }
    }, [handleNegotiationNeeded]);

    const handleNegotiationIncomming = useCallback(async({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', { to: from, ans });
    }, [socket]);

    const handleNegotiationFinal = useCallback(async({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams[0];
            console.log("GOT TRACKS", ev.streams);
            setRemoteStream(remoteStream);
        });
    }, []);

    useEffect(() => {
        socket.on('user:joined', handleUserJoined);
        socket.on('incoming:call', handleIncomingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on("peer:nego:needed", handleNegotiationIncomming);
        socket.on("peer:nego:final", handleNegotiationFinal);

        return () => {
            socket.off('user:joined', handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
            socket.off('call:accepted', handleCallAccepted);
            socket.off("peer:nego:needed", handleNegotiationIncomming);
            socket.off("peer:nego:final", handleNegotiationFinal);
        }
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegotiationIncomming, handleNegotiationFinal]);

    return(
        <div>
            <h1>Call Sceen</h1>
            <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
            {myStream && <button onClick={sendStreams}>Send Stream</button>}
            {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
            <br/>
            {myStream && 
                <><h1>My Stream</h1><ReactPlayer playing muted height="200px" width="300px" url={myStream} style={{ transform: 'scaleX(-1)' }} /></>}
            {remoteStream && 
                <><h1>Remote Stream</h1><ReactPlayer playing height="200px" width="300px" url={remoteStream} style={{ transform: 'scaleX(-1)' }} /></>}
        </div>
    )
}

export default RoomPage;
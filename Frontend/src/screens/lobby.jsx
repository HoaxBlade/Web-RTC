import React, {useState, useCallback, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = ()=> {
    const [name, setName] = useState("");
    const [room, setRoom] = useState(""); 
    
    const socket = useSocket();
    const navigate = useNavigate();

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        socket.emit("room:join", { name, room });
    }, [name, room, socket]);

    const handleJoinRoom = useCallback((data) => {
        const { name, room } = data;
        console.log(`Joining room ${room} as ${name}`);
        navigate(`/room/${room}`);
    }, [navigate]);

    useEffect(() => {
        socket.on("room:join", handleJoinRoom);
        console.log("Socket listening for room:join events");
        
        return() => {
            socket.off("room:join", handleJoinRoom);
        }
    }, [socket, handleJoinRoom]);
    
    return(
        <div>
            <h1>Lobby</h1>
            <form onSubmit={handleSubmitForm}>
                <label htmlFor="name">Name</label>
                <input type = "text" placeholder="Enter your name" id = "name" value={name} onChange={(e) => setName(e.target.value)}/>
                <br/><br/>
                <label htmlFor="room">Room Number</label>
                <input type = "text" placeholder="Enter Room number" id = "room" value={room} onChange={(e) => setRoom(e.target.value)}/>
                <br/><br/>
                <button>Join</button>
            </form>
        </div>
    )
}

export default LobbyScreen;
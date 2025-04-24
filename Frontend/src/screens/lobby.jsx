import React, {useState, useCallback, useEffect} from "react";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = ()=> {
    const [name, setName] = useState(""); 
    
    const socket = useSocket();

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        socket.emit("room:join", name);
    }, [name, socket]);

    useEffect(() => {
        socket.on("room:join", data => {console.log(`Data from Backend ${data}`)})
    }, [socket])
    
    return(
        <div>
            <h1>Lobby</h1>
            <form onSubmit={handleSubmitForm}>
                <label htmlFor="name">Name</label>
                <input type = "text" placeholder="Enter your name" id = "name" value={name} onChange={(e) => setName(e.target.value)}/>
                <br/><br/>
                <button>Join</button>
            </form>
        </div>
    )
}

export default LobbyScreen;
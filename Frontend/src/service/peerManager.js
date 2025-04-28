// "peer" import not used - removing it
// import peer from "./peer";

class peerManager{
    constructor() {
        this.peers = new Map();
    }

    createPeer(remoteid){
        console.log(`Creating new peer connection for ${remoteid}`);
        const peer = new RTCPeerConnection({
            iceServers: [{
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:global.stun.twilio.com:3478",
                ],
            }]
        });
        this.peers.set(remoteid, peer);
        return peer;
    }

    async createOffer(remoteid){
        const peer = this.peers.get(remoteid) || this.createPeer(remoteid);
        try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(new RTCSessionDescription(offer));
            console.log(`Created offer for ${remoteid}`);
            return offer;
        } catch (error) {
            console.error(`Error creating offer for ${remoteid}:`, error);
            throw error;
        }
    }

    async createAnswer(remoteid, offer){
        const peer = this.peers.get(remoteid) || this.createPeer(remoteid);
        try {
            await peer.setRemoteDescription(offer);
            const ans = await peer.createAnswer();
            await peer.setLocalDescription(new RTCSessionDescription(ans));
            console.log(`Created answer for ${remoteid}`);
            return ans;
        } catch (error) {
            console.error(`Error creating answer for ${remoteid}:`, error);
            throw error;
        }
    }

    async setRemoteDescription(remoteid, ans){
        const peer = this.peers.get(remoteid);
        if(peer){
            try {
                await peer.setRemoteDescription(new RTCSessionDescription(ans));
                console.log(`Set remote description for ${remoteid}`);
            } catch (error) {
                console.error(`Error setting remote description for ${remoteid}:`, error);
                throw error;
            }
        } else {
            console.error(`No peer found for ${remoteid} when setting remote description`);
        }
    }

    addTracks(remoteid, stream){
        const peer = this.peers.get(remoteid);
        if(peer && stream){
            try {
                console.log(`Adding tracks for ${remoteid}:`, stream.getTracks().map(t => t.kind));
                
                // First remove any existing tracks
                const senders = peer.getSenders();
                if (senders.length > 0) {
                    console.log(`Removing ${senders.length} existing senders before adding new tracks`);
                    senders.forEach(sender => {
                        if (sender.track) {
                            peer.removeTrack(sender);
                        }
                    });
                }
                
                // Then add all tracks from the stream
                stream.getTracks().forEach(track => {
                    console.log(`Adding ${track.kind} track to peer ${remoteid}`);
                    peer.addTrack(track, stream);
                });
            } catch (error) {
                console.error(`Error adding tracks for ${remoteid}:`, error);
            }
        } else {
            console.error(`Cannot add tracks: peer=${!!peer}, stream=${!!stream} for ${remoteid}`);
        }
    }

    removeTrack(remoteid, stream){
        const peer = this.peers.get(remoteid);
        if(peer && stream){
            try {
                stream.getTracks().forEach(track => {
                    peer.removeTrack(track);
                });
                console.log(`Removed tracks for ${remoteid}`);
            } catch (error) {
                console.error(`Error removing tracks for ${remoteid}:`, error);
            }
        }
    }

    replaceTrack(remoteid, oldTrack, newTrack){
        const peer = this.peers.get(remoteid);
        if(peer){
            try {
                const senders = peer.getSenders();
                const sender = senders.find(s => s.track && s.track.kind === oldTrack.kind);
                if(sender){
                    sender.replaceTrack(newTrack);
                    console.log(`Replaced ${oldTrack.kind} track for ${remoteid}`);
                    return true;
                }
                console.warn(`No sender found for ${oldTrack.kind} track for ${remoteid}`);
                return false;
            } catch (error) {
                console.error(`Error replacing track for ${remoteid}:`, error);
                return false;
            }
        }
        return false;
    }

    setUpDataChannel(remoteid, channelName = 'data'){
        const peer = this.peers.get(remoteid);
        if(!peer) return null;
        try {
            const dataChannel = peer.createDataChannel(channelName);
            console.log(`Created data channel ${channelName} for ${remoteid}`);
            return dataChannel;
        } catch (error) {
            console.error(`Error creating data channel for ${remoteid}:`, error);
            return null;
        }
    }

    registerIceCandidateHandler(remoteid, callback){
        const peer = this.peers.get(remoteid);
        if(peer){
            peer.onicecandidate = (event) => {
                if(event.candidate){
                    console.log(`ICE candidate for ${remoteid}:`, event.candidate.candidate.substring(0, 50) + '...');
                    callback(event.candidate);
                }
            };
            console.log(`Registered ICE candidate handler for ${remoteid}`);
        } else {
            console.error(`Cannot register ICE handler: no peer for ${remoteid}`);
        }
    }

    registerTrackHandler(remoteid, callback){
        const peer = this.peers.get(remoteid);
        if(peer){
            peer.ontrack = (event) => {
                console.log(`Track received from ${remoteid}:`, event.streams[0].getTracks().map(t => t.kind));
                callback(event.streams[0], remoteid);
            };
            console.log(`Registered track handler for ${remoteid}`);
        } else {
            console.error(`Cannot register track handler: no peer for ${remoteid}`);
        }
    }

    registerNegotiationNeededHandler(remoteid, callback){
        const peer = this.peers.get(remoteid);
        if(peer){
            peer.onnegotiationneeded = () => {
                console.log(`Negotiation needed for ${remoteid}`);
                callback(remoteid);
            };
            console.log(`Registered negotiation handler for ${remoteid}`);
        } else {
            console.error(`Cannot register negotiation handler: no peer for ${remoteid}`);
        }
    }

    registerDataCahannelHandler(remoteid, callback){
        const peer = this.peers.get(remoteid);
        if(peer){
            peer.ondatachannel = (event) => {
                console.log(`Data channel received from ${remoteid}`);
                callback(event.channel, remoteid);
            };
            console.log(`Registered data channel handler for ${remoteid}`);
        } else {
            console.error(`Cannot register data channel handler: no peer for ${remoteid}`);
        }
    }

    async addIceCandidate(remoteid, candidate){
        const peer = this.peers.get(remoteid);
        if(peer){
            try {
                await peer.addIceCandidate(new RTCIceCandidate(candidate));
                console.log(`Added ICE candidate for ${remoteid}`);
            } catch (error) {
                console.error(`Error adding ICE candidate for ${remoteid}:`, error);
            }
        } else {
            console.error(`Cannot add ICE candidate: no peer for ${remoteid}`);
        }
    }

    closePeer(remoteid){
        const peer = this.peers.get(remoteid);
        if(peer){
            try {
                peer.close();
                this.peers.delete(remoteid);
                console.log(`Closed peer connection for ${remoteid}`);
            } catch (error) {
                console.error(`Error closing peer for ${remoteid}:`, error);
            }
        }
    }

    closeAllPeers(){
        console.log(`Closing all ${this.peers.size} peer connections`);
        this.peers.forEach((peer, remoteid) => {
            try {
                peer.close();
            } catch (error) {
                console.error(`Error closing peer for ${remoteid}:`, error);
            }
        });
        this.peers.clear();
    }
}

export default new peerManager();
// adapated from sample player in https://github.com/mrlt8/docker-wyze-bridge
export default class WebRtcVideoPlayer {

    private videoElement : HTMLVideoElement;
    private url : URL;
    private terminated : boolean = false;
    private ws : any;
    private pc : any;
    private restartTimeout : any;

    constructor(videoElement : HTMLVideoElement, url : URL){
        this.videoElement = videoElement;
        this.url = url;
    }
    
    start() {
        console.log("connecting");

        if ( !this.url ){
            console.error("no webRtcSrc url");
            return;
        }

        console.log("webRtcSrc=", this.url);

        this.ws = new WebSocket(this.url);

        this.ws.onerror = () => {
            console.log("ws error");
            if (this.ws === null) {
                return;
            }
            this.ws.close();
            this.ws = null;
        };

        this.ws.onclose = () => {
            console.log("ws closed");
            this.ws = null;
            this.scheduleRestart();
        };

        this.ws.onmessage = (msg : any) => this.onIceServers(msg);
    }

    terminate(){
        this.terminated = true;

        this.ws.close();
        this.pc.close();
    }

    onIceServers(msg : any) {
        if (this.ws === null) {
            return;
        }

        const iceServers = JSON.parse(msg.data);

        this.pc = new RTCPeerConnection({
            iceServers,
        });

        this.ws.onmessage = (msg : any) => this.onRemoteDescription(msg);
        this.pc.onicecandidate = (evt : any) => this.onIceCandidate(evt);

        this.pc.oniceconnectionstatechange = () => {
            if (this.pc === null) {
                return;
            }

            console.log("peer connection state:", this.pc.iceConnectionState);

            switch (this.pc.iceConnectionState) {
            case "disconnected":
                this.scheduleRestart();
            }
        };

        this.pc.ontrack = (evt : any) => {
            console.log("new track " + evt.track.kind);
            this.videoElement.srcObject = evt.streams[0];
        };

        const direction = "sendrecv";
        this.pc.addTransceiver("video", { direction });
        this.pc.addTransceiver("audio", { direction });

        this.pc.createOffer()
            .then((desc : any) => {
                if (this.pc === null || this.ws === null) {
                    return;
                }

                this.pc.setLocalDescription(desc);

                console.log("sending offer");
                this.ws.send(JSON.stringify(desc));
            });
    }

    onRemoteDescription(msg : any) {
        if (this.pc === null || this.ws === null) {
            return;
        }

        this.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)));
        this.ws.onmessage = (msg : any) => this.onRemoteCandidate(msg);
    }

    onIceCandidate(evt : any) {
        if (this.ws === null) {
            return;
        }

        if (evt.candidate !== null) {
            if (evt.candidate.candidate !== "") {
                this.ws.send(JSON.stringify(evt.candidate));
            }
        }
    }

    onRemoteCandidate(msg : any) {
        if (this.pc === null) {
            return;
        }

        this.pc.addIceCandidate(JSON.parse(msg.data));
    }

    scheduleRestart() {
        if (this.ws !== null) {
            this.ws.close();
            this.ws = null;
        }

        if (this.pc !== null) {
            this.pc.close();
            this.pc = null;
        }

        if (this.terminated) {
            return;
        }

        this.restartTimeout = window.setTimeout(() => {
            this.restartTimeout = null;
            this.start();
        }, 2000);
    }
}
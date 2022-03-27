const SOCKET_SERVER = "https://server.glebe.me";

/**
 * Events:
 *   "connected to server" -> None
 *   "created a room"      -> None
 *   "joined a room"       -> None
 *   "other joined"        -> (otherID, data)
 *   "data from room"      -> (otherID, data, isHost)
 */
class MultiplayerService extends Phaser.Events.EventEmitter {
    constructor() {
        super();
        this.isHost = false;
        this.room = null;
        this.socket = io(SOCKET_SERVER);
        this.socket.on('connect', () => {
            this.emit("connected to server");
        });
        this.socket.on("other joined", (otherID, data) => {
            this.emit('other joined', otherID, data);
        });
        this.socket.on("data from room", (otherID, data, isHost) => {
            this.emit('data from room', otherID, data, isHost);
        });
    }

    /**
     * 
     * @returns {MultiplayerService}
     */
    static get() {
        if (!MULTI_INSTANCE)
            MULTI_INSTANCE = new MultiplayerService()
        return MULTI_INSTANCE;
    }

    id() {
        return this.socket.id;
    }

    createRoom() {
        // Generate a room id
        this.room = this.generateID();
        // Create the room
        this.socket.emit("create room", this.room, (result) => {
            console.log(result);
        });
        // Mark yourself as the host
        this.isHost = true;
        this.emit('created a room');
    }

    joinRoom(roomID, data) {
        this.room = roomID;
        this.socket.emit('join room', roomID, data);
        this.emit('joined a room');
    }

    broadcast(data) {
        this.socket.emit("send to room", this.room, data);
    }

    generateID() {
        let idtim = Date.now().toString(36);
        idtim = idtim.substring(idtim.length - 4);
        let idrng = Math.random().toString(36);
        idrng = idrng.substring(idrng.length - 4);
        return idtim + idrng;
    }
}
let MULTI_INSTANCE = null;
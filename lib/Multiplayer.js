/**
 * Events:
 *   "ready" -> null
 *   "self joined" -> null
 *   "player connected" -> DataConnection
 *   "player joined" -> DataConnection
 *   "peer list received" -> string[]
 *   "message received" -> any
 */
class Multiplayer extends Phaser.Events.EventEmitter {
    constructor(id, host, port, peerjsOptions) {
        super();
        let options = peerjsOptions || {};
        options.host = host;
        options.port = port;
        this.self = new Peer(id, options);
        this.bossID = null;
        this.players = {};
        // Check when you yourself are ready to start
        this.self.on('open', () => {
            this.emit('ready');
            this.self.on('connection', (dataconn) => {
                // Emit a signal that another player has joined
                this.emit('player connected', dataconn);
                this._registerPlayer(dataconn);
            });
        });
        // Look for errors
        this.self.on('error', (err) => {
            this.emit('error', err);
        });
    }

    createRoom() {
        // Set yourself as the boss
        this.bossID = this.self.id;
        // Check if a global callback is defined
        this.emit('self joined');
    }

    joinRoom(gameID) {
        this.bossID = gameID;
        this._registerPlayer(this.self.connect(this.bossID));
    }

    broadcast(message) {
        for (let peer of Object.values(this.players)) {
            peer.send(message);
        }
    }

    isBoss(playerID) {
        const id = playerID || this.self.id;
        return id == this.bossID;
    }

    _registerPlayer(dataconn) {
        // Add the new connection to the list of players
        this.players[dataconn.peer] = dataconn;
        // If I am the boss, I should share the list of players with the new player
        dataconn.on('open', () => {
            // If it is the boss being registered, let the game know we just joined
            if (this.isBoss(dataconn.peer)) {
                this.emit('self joined');
            }
            // If it isn't the boss being registered, let the game know a player has joined
            else if (!(dataconn.peer in Object.keys(this.players))) {
                this.emit('player joined', dataconn);
            }
            // If I am the boss, send the peer list to the new player
            if (this.isBoss()) {
                dataconn.send({
                    type: 'peer list',
                    peers: Object.keys(this.players)
                });
            }
            // When data is received from a peer
            dataconn.on('data', (data) => {
                // If the peer is the boss and they are sending a peer list, connect to all peers
                if (this.isBoss(dataconn.peer) && data.type == "peer list") {
                    for (let peer of data.peers) {
                        if (peer != this.self.id)
                            this._registerPlayer(this.self.connect(peer));
                    }
                    this.emit('peer list received', Object.keys(this.players))
                }
                // All other cases, let the game know a message was received and who send it
                else {
                    this.emit('message received', dataconn.peer, data);
                }
            });
        });
    }
}

function generateID() {
    let idtim = Date.now().toString(36);
    idtim = idtim.substring(idtim.length - 4);
    let idrng = Math.random().toString(36);
    idrng = idrng.substring(idrng.length - 4);
    return idtim + idrng;
}

let MULTI = new Multiplayer(undefined, "server.glebe.me", 9000, {
    secure: true
});

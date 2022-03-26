/**
 * Global action functions to perform room related commands
 * prConnect(options?)
 * prCreateRoom()
 * prJoinRoom(roomID)
 * prBroadcast(data)
 * prIsBoss(peerID?)
 * 
 * Global event functions to implement in your script
 * prSelfJoined()
 * prOtherJoined(dataconn)
 * prMessageReceived(peerID, data)
 * prPeerListReceived(others)
 */

var prSelf = null;
var prBossID = null;
var prOthers = {};

function prConnect(options) {
    let idtim = Date.now().toString(36);
    idtim = idtim.substring(idtim.length - 4);
    let idrng = Math.random().toString(36);
    idrng = idrng.substring(idrng.length - 4);
    prSelf = new Peer(idtim + idrng, options);
    prBossID = null;
    prOthers = {};

    // Handle connections from other peers
    prSelf.on('connection', function (dataconn) {
        // Add the new peer to others
        prOthers[dataconn.peer] = dataconn;
        // If a callback is defined globally, run it
        if (typeof prOtherJoined === 'function') {
            prOtherJoined(dataconn);
        }
        // If I am the boss, then I should share the list of peers
        if (prIsBoss()) {
            setTimeout(() => {
                dataconn.send({
                    type: "peer list",
                    peers: Object.keys(prOthers)
                });
            }, 20);
        }
        // When data is received from a peer
        dataconn.on('data', function (data) {
            _prOnData(dataconn, data);
        });
    });
}

function prCreateRoom() {
    // Set yourself as the boss
    prBossID = prSelf.id;
    // Check if a global callback is defined
    if (typeof prSelfJoined === 'function') {
        prSelfJoined();
    }
}

function prJoinRoom(roomID) {
    prBossID = roomID;
    prOthers[prBossID] = prSelf.connect(roomID);
    // Behavior upon successful connection
    prOthers[prBossID].on('open', function () {
        // Check if a global callback is defined
        if (typeof prSelfJoined === 'function') {
            prSelfJoined();
        }
    });
    // When data is received from a peer
    prOthers[prBossID].on('data', function (data) {
        _prOnData(prOthers[prBossID], data);
    });
}

function prBroadcast(data) {
    for (let peer of Object.values(prOthers)) {
        peer.send(data);
    }
}

function prIsBoss(peerID) {
    const id = peerID || prSelf.id;
    return id == prBossID;
}

function _prOnData(dataconn, data) {
    if (data.type == "peer list" && prIsBoss(dataconn.peer)) {
        for (let peer of data.peers) {
            if (peer != prSelf.id)
                prOthers[peer] = prSelf.connect(peer);
        }
        if (typeof prPeerListReceived === 'function') {
            prPeerListReceived(Object.keys(prOthers));
        }
    }
    else if (typeof prMessageReceived === 'function') {
        prMessageReceived(dataconn.peer, data);
    }
}
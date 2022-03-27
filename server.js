const fs = require('fs');
const express = require('express');
const app = express();
const https = require('https');

const options = {
    cert: fs.readFileSync('./sslcert/fullchain.pem'),
    key: fs.readFileSync('./sslcert/privkey.pem')
};

const server = https.createServer(options, app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: ["http://127.0.0.1:5501", "https://server.glebe.me", "https://jeremyglebe.com"]
    },
    secure: true
});

app.use(express.static('static'));

// All connected users
let clientSockets = {};
let roomHosts = {};

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Add the client to the list of clients
    clientSockets[socket.id] = socket;

    // Handle creating a new room
    socket.on('create room', (roomID, callback) => {
        if (!(roomID in Object.keys(roomHosts))) {
            socket.join(roomID);
            roomHosts[roomID] = socket.id;
            callback("room created");
        }
        else {
            callback("room id taken");
        }
    });

    // Handle joining of room
    socket.on('join room', (roomID, data) => {
        socket.join(roomID);
        socket.to(roomID).emit("other joined", socket.id, data);
    });

    // Handle sending of data to the user's room
    socket.on("send to room", (roomID, data) => {
        const isHost = socket.id == roomHosts[roomID];
        socket.to(roomID).emit("data from room", socket.id, data, isHost);
    });
});

server.listen(443, () => {
    console.log('Data server listening on *:443');
});
const io = require('socket.io')();
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeId } = require('./utils');

const state = {};
const clientRooms = {};

io.on('connection', client => {

    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(roomName) {
        // game needs to exist in order for you to join
        const room = io.sockets.adapter.rooms[roomName];

        //grab current players already in room
        let allUsers;
        if(room) {
            allUsers = room.sockets;
        }

        let numClients = 0;
        if(allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        if(numClients === 0) {
            client.emit('unknownCode');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        } 

        clientRooms[client.id] = roomName;

        client.join(roomName);
        client.number = 2;
        client.emit('init', 2);

        startGameInterval(roomName);
    }

    function handleNewGame() {
        let roomName = makeId(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);
    
        state[roomName] = initGame();
    
        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
      }

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];

        if(!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch (error) {
            console.log(error);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if(vel) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        if(!winner) {
            emitGameState(roomName, state[roomName])
            // client.emit('gameState', JSON.stringify(state));
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
    // send a msg to all clients in roomName
    io.sockets.in(room)
        .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
    io.sockets.in(room)
        .emit('gameOver', JSON.stringify({ winner: winner }));
}

io.listen(process.env.PORT || 3000);
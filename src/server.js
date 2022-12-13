import express from "express";
import path from 'path';
import http from "http";
import { Server as SocketIO } from "socket.io";
import { instrument } from '@socket.io/admin-ui'
const __dirname = path.resolve();

const app = express();

console.log("hello")

app.set("view engine", "pug")
app.set("views", __dirname + "/src/public/views");
app.use("/public", express.static(__dirname + "/src/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');

const server = http.createServer(app);
const wsServer = new SocketIO(server, {
    cors: {
        origin: ['https://admin.socket.io'],
        credentials: true
    }
})

instrument(wsServer, {
    auth: false
})

const publicRooms = () => {
    const { sids, rooms} = wsServer.sockets.adapter;
    const publicRooms = []
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key)
        }
    })
    return publicRooms
}

const countRoom = (roomName) => {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;

}
wsServer.on('connection', socket => {
    socket.on('enter_room', (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
        wsServer.sockets.emit('room_change', publicRooms())
    })
    socket.on('disconnecting', () => {
        socket.rooms.forEach(room => {
            return socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1)
        })
    })
    socket.on('disconnect', () => {
        wsServer.sockets.emit('room_change', publicRooms())
    })
    socket.on('new_message', (msg, room, done) => {
        socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
        done();
    })
    socket.on('nickname', (nickname) => {
        socket['nickname'] = nickname
    })
})

wsServer.on('connection', socket => {
    socket.on('join_room', (roomName) => {
        socket.join(roomName)
        socket.to(roomName).emit('welcome')
    })
    socket.on('offer', (offer, roomName) => {
        socket.to(roomName).emit('offer', offer)
    })
    socket.on('answer', (answer, roomName) => {
        socket.to(roomName).emit('answer', answer)
    })
})

server.listen(3000, handleListen)


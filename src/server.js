import express from "express";
import path from 'path';
import http from "http";
import { Server as SocketIO } from "socket.io";
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
const wsServer = new SocketIO(server)

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

//
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket['nickname'] = 'Anon';
//     console.log("Connected to the Browser!")
//     socket.on("close",onSocketClose)
//     socket.on("message", (raw) => {
//         const msg = raw.toString('utf-8')
//         const message = JSON.parse(msg)
//         switch (message.type) {
//             case "new_message":
//                 sockets.forEach(each => each.send(`${socket.nickname}: ${message.payload}`)); break;
//             case "nickname":
//                 socket['nickname'] = message.payload;
//         }
//     })
// })





server.listen(3000, handleListen)


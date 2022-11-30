import express from "express";
import { WebSocketServer }  from "ws";
import path from 'path';
import http from "http";
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
const wss = new WebSocketServer({ server })


function onSocketClose() {
    console.log("Disconnected from the Browser!")
}

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    console.log("Connected to the Browser!")
    socket.on("close",onSocketClose)
    socket.on("message", (message) => {
        sockets.forEach(each => each.send(message.toString('utf-8')));
    })
})





server.listen(3000, handleListen)


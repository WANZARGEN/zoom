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

function handleConnection(stream) {
    console.log('connected', stream)
}

wss.on("connection", handleConnection)

server.listen(3000, handleListen)
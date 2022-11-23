const socket = new WebSocket(`ws://${window.location.host}`)

socket.addEventListener("open", () => {
    console.log("Connected to the Server!")
})

socket.addEventListener("message", (message) => {
    console.log(message.data)
})


socket.addEventListener("close", (message) => {
    console.log("Disconnected from the Server!")
})

setTimeout(() => {
    socket.send('Hello from the Browser!')
}, 1000)
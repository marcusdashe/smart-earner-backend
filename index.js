require('dotenv').config()
const app = require("./server")
const http = require("http")
const path = require("path")
const debug = require("debug")

const server = http.createServer(app)
const normalizePort = (val) => {
    let port = parseInt(val, 10)
    if(isNaN(port))
        return val
    
    if(port >= 0)
        return port
    
    return false
}

const onError = (error)=> {
    if(error.syscall !== "listen")
        throw error
         
    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port

    switch(error.code){
        case "EACCES": 
            console.error(bind + "requires elevated privileges")
            process.exit(1)
            break
        case "EADDRINUSE": 
            console.error(bind + "is already in use")
            process.exit(1)
            break
        default:
            throw error
    }
}

const onListening = () => {
    let addr = server.address()
    let bind = typeof addr === "string" ? "Pipe" + addr : "Port " + addr.port
    debug("Listening on" + bind)
}

app.set("port",  normalizePort(process.env.PORT || "5000"))
app.set("env", process.env.NODE_ENV)

function startServer(){
    server.listen(app.get("port"), ()=> {
        console.log(`Express Server started in ${app.get("env")} mode on http://127.0.0.1:${app.get("port")} `)
        console.log("Press Ctrl + C to terminate")
    }).on("error", onError).on("listening", onListening)
}

require.main === module ? startServer() : module.export = startServer





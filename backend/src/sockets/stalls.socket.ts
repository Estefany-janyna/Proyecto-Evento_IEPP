import type {Server} from 'socket.io';export function registerStalls(io:Server){io.on('connection',socket=>{socket.on('stall:stock-updated',data=>socket.broadcast.emit('stall:stock-updated',data))})}

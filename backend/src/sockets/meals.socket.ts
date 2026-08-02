import type {Server} from 'socket.io';export function registerMeals(io:Server){io.on('connection',socket=>{socket.on('meal:delivered',data=>socket.broadcast.emit('meal:delivered',data))})}

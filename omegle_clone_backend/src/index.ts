import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { UserManager } from './managers/userManager';

const app = express();
const server = createServer(app);
const io = new Server(server ,{
  cors:{
    origin:"*"
  }
});

app.get('/', (req, res) => {
});

const userManager =new UserManager();

io.on('connection', (socket) => {
  console.log(`a user connected ${socket.handshake.query.name}`);
  const name = socket.handshake.query.name
  if(!name || Array.isArray(name)) return 
  userManager.addUser(name,socket)
  socket.on('disconnect',()=>{
    console.log("userdiconncted")
    userManager.removeUser(socket.id)
  })
});

server.listen(3001, () => {
  console.log('server running at http://localhost:3000');
});
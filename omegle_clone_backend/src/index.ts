import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { UserManager } from './managers/userManager';

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send("server is running");
});

const userManager = new UserManager();

io.on('connection', (socket) => {
  console.log(`a user connected ${socket.handshake.query.name}`);
  const name = socket.handshake.query.name;
  if (!name || Array.isArray(name)) return;
  userManager.addUser(name, socket);
  socket.on('disconnect', () => {
    console.log("user disconnected");
    userManager.removeUser(socket.id);
  });
});

export default server;

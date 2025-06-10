const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const apiRoutes = require('./routes/api');

require('./sockets/stream')(io);

app.use(express.json());
app.use('/api', apiRoutes);

server.listen(3001, () => console.log('Backend running on http://localhost:3001'));

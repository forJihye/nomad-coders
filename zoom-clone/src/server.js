import http from 'http';
import express from 'express';
import WebSocket from 'ws';

const app = express();

app.set('view engine', "pug");
app.set('views', __dirname + "/views");
app.use('/public', express.static(__dirname + '/public'))

app.get('/', (req, res) => res.render('home'));

// app.listen(3000, () => console.log('http://localhost:3000'));

const server = http.createServer(app);

const sockets = new Set();

const wss = new WebSocket.Server({ server });
wss.on("connection", (socket) => { // socket : 연결된 브라우저
  sockets.add(socket);
  console.log('Connected to Browser ✅');
  socket.on("close", () => console.log('Disconnected from the Browser ❌'))
  socket.on('message', message => {
    socket.send(message.toString());
  })
  socket.send('hello');
});

server.listen(3000, () => console.log('http://localhost:3000, ws://localhost:3000'));

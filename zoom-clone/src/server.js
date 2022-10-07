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
const wss = new WebSocket.Server({ server });

const handlerConnection = (socket) => {
  // socket : 연결된 브라우저
  console.log(socket)
}
wss.on("connection", handlerConnection);

server.listen(3000, () => console.log('http://localhost:3000, ws://localhost:3000'));

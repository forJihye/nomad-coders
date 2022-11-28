import http from 'http';
import express from 'express';
import WebSocket from 'ws';
import SocketIo from 'socket.io'; // https://socket.io/

const app = express();

app.set('view engine', "pug");
app.set('views', __dirname + "/views");
app.use('/public', express.static(__dirname + '/public'))

app.get('/', (req, res) => res.render('home'));
// app.listen(3000, () => console.log('http://localhost:3000'));

const httpServer = http.createServer(app);
const wsServer = SocketIo(httpServer)

const publicRooms = () => {
  const {sockets: {adapter: {sids, rooms}}} = wsServer;
  const publicRoom = [];
  rooms.forEach((_, key) => {
    (!sids.has(key)) && publicRoom.push(key);
  })
  return publicRoom;
}

const countRoom = (roomName) => {
  const {sockets: {adapter: {rooms}}} = wsServer;
  return rooms.has(roomName) ? rooms.get(roomName).size : 0
}

wsServer.on("connection", socket => {
  socket.on('join_room', (roomName) => {
    socket.join(roomName)
    socket.to(roomName).emit('welcome')
  });
  socket.on('offer', (offer, roomName) => {
    socket.to(roomName).emit('offer', offer)
  })
  socket.on('answer', (answer, roomName) => {
    socket.to(roomName).emit('answer', answer);
  })
  socket.on('ice', (ice, roomName) => {
    socket.to(roomName).emit('ice', ice);
  })

  socket['nickname'] = 'Anon';

  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName); // Room 생성
    done();
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName)); // 자신의 Room 을 제외한 모든 Room 에게 메시지 등록
    wsServer.sockets.emit('room_change', publicRooms()) // 모든 소캣에 메시지 전송
  });
  
  socket.on('new_message', (msg, roomName, done) => {
    socket.to(roomName).emit('new_message', `${socket.nickname}: msg`)
    done();
  })
  socket.on('nickname', (nick) => {
    socket['nickname'] = nick;
  })
  socket.on('disconnecting', () => {
    socket.rooms.forEach(room => socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1))
  })
  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms()) // 모든 소캣에 메시지 전송
  })
})
// const wss = new WebSocket.Server({ server });
// const sockets = [] // 연결된 브라우저 저장소
// wss.on("connection", (socket) => { // socket : 연결된 브라우저
//   sockets.push(socket);
//   socket["nickname"] = 'Anon';
//   console.log('Connected to Browser ✅');
//   socket.on("close", () => console.log('Disconnected from the Browser ❌'))
//   socket.on('message', msg => {
//     const message = JSON.parse(msg.toString());
//     switch(message.type) {
//     case 'new_message': 
//       sockets.forEach(aSocket => {
//         aSocket.send(`${socket.nickname}: ${message.payload}`);
//       })
//     case 'nickname': 
//       socket["nickname"] = message.payload
//     }
//   })
// });

httpServer.listen(3000, () => console.log('http://localhost:3000, ws://localhost:3000'));

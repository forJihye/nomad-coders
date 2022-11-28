const socket = io();

const welcome = document.getElementById('welcome')
const form = welcome.querySelector('form')
const room = document.getElementById('room')

room.hidden = true
let roomName = '';

function addMessage(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.append(li);
}

const handlerMessageSubmit = (ev) => {
  ev.preventDefault();
  const input = ev.target.querySelector('input');
  const value = input.value
  socket.emit('new_message', input.value, roomName, () => addMessage(`You: ${value}`))
  input.value = '';
}

const handlerNickSubmit = (ev) => {
  ev.preventDefault();
  const input = ev.target.querySelector('input')
  const value = input.value;
  socket.emit('nickname', value)
}

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3')
  h3.innerText = `Room: ${roomName}`;

  const msgForm = room.querySelector('#message');
  const nickForm = room.querySelector('#nick');
  msgForm.addEventListener('submit', handlerMessageSubmit)
  nickForm.addEventListener('submit', handlerNickSubmit)
};

const handlerRoomSubmit = (ev) => {
  ev.preventDefault();
  const input = form.querySelector('input');
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = '';
}
form.addEventListener('submit', handlerRoomSubmit)

socket.on('welcome', (user, newCount) => {
  const h3 = room.querySelector('h3')
  h3.innerText = `Room: ${roomName} (${newCount})`;
  addMessage(user + ' joined!');  
})

socket.on('bye', (user, newCount) => {
  const h3 = room.querySelector('h3')
  h3.innerText = `Room: ${roomName} (${newCount})`;
  addMessage(user + ' leftㅠㅠ');  
})

socket.on('new_message', addMessage)

socket.on('room_change', (rooms) => {
  const roomList = welcome.querySelector('ul');
  roomList.innerHTML = '';
  if (rooms.length === 0) return;
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.innerText = room;
    roomList.append(li)
  })
})
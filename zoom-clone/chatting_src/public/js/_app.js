const messageList = document.querySelector("ul");
const nickFrom = document.querySelector("#nick");
const messageFrom = document.querySelector("#message");

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener('open', () => {
  console.log('Connected to Server  ✅')
})

socket.addEventListener('message', (message) => {
  // console.log('New Message: ', message.data);
  const li = document.createElement('li');
  li.innerText = message.data;
  messageList.append(li);
})

socket.addEventListener('close', () => {
  console.log('Disconnected from Server ❌')
})

// setTimeout(() => {
//   socket.send("hello from the Browser!")
// }, 10000);
const handlerNickSave = (ev) => {
  ev.preventDefault();
  const input = nickFrom.querySelector('input');
  socket.send(JSON.stringify({
    type: 'nickname',
    payload: input.value
  }));
  input.value = "";
}

const handlerMessageSubmit = (ev) => {
  ev.preventDefault();
  const input = messageFrom.querySelector('input');
  socket.send(JSON.stringify({
    type: 'new_message',
    payload: input.value
  }));
  input.value = "";
}

nickFrom.addEventListener('submit', handlerNickSave)
messageFrom.addEventListener('submit', handlerMessageSubmit)
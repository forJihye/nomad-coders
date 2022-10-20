const messageList = document.querySelector("ul");
const messageFrom = document.querySelector("form");

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener('open', () => {
  console.log('Connected to Server  ✅')
})

socket.addEventListener('message', (message) => {
  console.log('New Message: ', message.data);
})

socket.addEventListener('close', () => {
  console.log('Disconnected from Server ❌')
})

// setTimeout(() => {
//   socket.send("hello from the Browser!")
// }, 10000);
const handlerSubmit = (ev) => {
  ev.preventDefault();
  const input = messageFrom.querySelector('input');
  socket.send(input.value);
  input.value = "";
}
messageFrom.addEventListener('submit', handlerSubmit)
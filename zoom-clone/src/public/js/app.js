const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById('call');

call.hidden = true;

let myStream
let muted = false;
let cameraOff = false;
let roomName = ''

/** @type {RTCPeerConnection} */
let myPeerConnection;

const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === 'videoinput');
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach(camera => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label)  {
        option.selected = true
      } 
      camerasSelect.appendChild(option)
    })
  } catch(e) {
    console.error(e)
  }
}
const getMedia = async (deviceId) => {
  try {
    const constraints = !deviceId ? {
      audio: true,
      video: { facingMode: "user" }
    } : {
      audio: true,
      video: {
        deviceId: { exact: deviceId }
      }
    }
    myStream = await window.navigator.mediaDevices.getUserMedia(constraints)
    console.log(2)
    myFace.srcObject = myStream;
    !deviceId && await getCameras();
  } catch(e) {
    console.error(e)
  }
}

const handlerMuteClick = (ev) => {
  myStream.getAudioTracks().forEach(track => (track.enabled = !track.enabled))
  if (muted) {
    muteBtn.innerText = 'Muted'
    muted = false
  } else {
    muteBtn.innerText = 'UnMuted'
    muted = true
  }
}
const handlerCameraClick = (ev) => {
  myStream.getVideoTracks().forEach(track => (track.enabled = !track.enabled))
  if (cameraOff) {
    cameraBtn.innerText = 'Turn Cameara Off'
    cameraOff = false
  } else {
    cameraBtn.innerText = 'Turn Cameara On'
    cameraOff = true
  }
}

const handlerCameraChange = async (ev) => {
  await getMedia(camerasSelect.value)
}

muteBtn.addEventListener('click', handlerMuteClick)
cameraBtn.addEventListener('click', handlerCameraClick)
camerasSelect.addEventListener('input', handlerCameraChange)

// Welcome Form (join a Room)
const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form');

const initCall = async () => {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection()
}

const handlerRoomSubmit = async (ev) => {
  ev.preventDefault();
  const input = ev.target.querySelector('input');
  const value = input.value;
  await initCall();
  socket.emit('join_room', value)
  roomName = value;
  input.value = '';
}

welcomeForm.addEventListener('submit', handlerRoomSubmit)

// Socket code
socket.on('welcome', async () => {
  console.log('joined!');
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer)
  socket.emit('offer', offer, roomName);
});

socket.on('offer', async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit('answer', answer, roomName);
});

socket.on('answer', async (answer) => {
  myPeerConnection.setRemoteDescription(answer);
})

// RTC Code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream))
}
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream
let muted = false;
let cameraOff = false;

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
    myStream = await navigator.mediaDevices.getUserMedia(!deviceId ? {
      audio: true,
      video: {
        facingMode: "user"
      }
    } : {
      audio: true,
      video: {
        deviceId: {
          exact: deviceId
        }
      }
    });
    myFace.srcObject = myStream;
    !deviceId && await getCameras();
  } catch(e) {
    console.error(e)
  }
}
getMedia();


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
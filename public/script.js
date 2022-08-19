const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const button = document.getElementById('endCallButton')
const msgBox = document.getElementById('msgBox')
const MuteButton = document.getElementById('MuteButton')
const offVideo = document.getElementById('offVideo')

var currentCall;
var __stream;

const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
let currentUser = {};

const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  __stream = stream;

  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {

    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()

})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
  currentUser.id = id
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  currentCall = call
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call

}

function addVideoStream(video, stream) {
  currentUser.video = video
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

async function endCall() {
  var userId = currentUser.id
  if (peers[userId]) peers[userId].close()
  var tracks = await __stream.getTracks();
  const h1 = document.createElement('h1');
  var text = document.createTextNode("Thank You ");
  h1.appendChild(text)
  msgBox.appendChild(h1)
  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    track.stop();
  }
  currentUser.video.remove()
  currentCall = null
  videoGrid.remove()
  button.remove()
  MuteButton.remove()
  offVideo.remove()
  msgBox.style.display = "block";
  window.location.href = '/meeting/join'
}

async function muteMic() {
  console.log(__stream.getAudioTracks())
  __stream.getAudioTracks()[0].enabled = !(__stream.getAudioTracks()[0].enabled);
}

async function offCam() {
  __stream.getVideoTracks()[0].enabled = !(__stream.getVideoTracks()[0].enabled);
}
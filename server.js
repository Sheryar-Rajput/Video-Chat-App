const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const db = require('./DB/config')
const MeetingRoom = require('./DB/RoomModel')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.get('/', async (req, res) => {
  const uuid = uuidV4()
  const result = await MeetingRoom.create({ roomId: uuid })
  if (result) {
    res.redirect(`/${uuid}`)
  }
  else {
    res.send('unable to join')
  }
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})
app.get('/meeting/join', (req, res) => {
  res.render('home')

})
app.get('/meeting/askjoin/:id', async (req, res) => {
  const roomId = req.params.id
  const result = await MeetingRoom.findOne({ roomId,status : 'ACTIVE'})
  if (result) {
    res.redirect(`/${roomId}`)
  }
  else {
    res.redirect('/meeting/join')
  }
})
io.on('connection', socket => {
  socket.on('join-room', async (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    await addUserInDb(roomId, userId)
    socket.on('disconnect', async () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
      await removeUserInDb(roomId, userId)
    }
    )
  })
})
db.connection.once('open', () => {
  console.log('db connected')
})
  .on('error', (err) => {
    console.log('err in connecting Mongodb: ', err)
  })
//for adding id in database
async function addUserInDb(roomId, userId) {
  try {
    await MeetingRoom.findOneAndUpdate({ roomId: roomId }, { $push: { persons: userId } }, { new: true })
  }
  catch (err) {
    console.log(err.message)

  }
}
//for remove user id from database
async function removeUserInDb(roomId, userId) {
  try {
    console.log('this id', roomId, userId)
    await MeetingRoom.findOneAndUpdate({ roomId: roomId }, { $pull: { persons: userId } }, { new: true })
    await MeetingRoom.findOneAndUpdate({ roomId, persons: { $size: 0 } }, { status: "DEACTIVE" })
  }
  catch (err) {
    console.log(err.message)
  }
}
server.listen(3000)
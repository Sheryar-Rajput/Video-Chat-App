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
app.get('/',async(req, res) => {
  const uuid = uuidV4()
  console.log(uuid)
  const result = await MeetingRoom.create({roomId : uuid })
  if(result){
    res.redirect(`/${uuid}`)
  }
  else{
    res.send('unable to join')
  }
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})
app.get('/meeting/join',(req,res)=>{
  res.render('home')

})
app.get('/meeting/askjoin/:id',async(req,res)=>{
const roomId = req.params.id
const result = await MeetingRoom.findOne({roomId})
if(result){
  res.redirect(`/${roomId}`)
}
else{
  res.redirect('/meeting/join')
}
})
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})
db.connection.once('open', () => {
  console.log('db connected')
})
.on('error', (err) => {
  console.log('err in connecting Mongodb: ', err)
})
server.listen(3000)
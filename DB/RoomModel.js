const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Room = new Schema(
    {
        roomId: {
         type  : String,
         required : true 
        },
        persons: {
            type: [String],
          
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'DEACTIVE'],
            default: "ACTIVE",

        },
    }
)
const MeetingRoom = mongoose.model('Meeting Room', Room)
module.exports = MeetingRoom
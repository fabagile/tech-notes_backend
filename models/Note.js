const mongoose = require('mongoose')
const { Schema, model } = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const noteSch = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
},
{ timestamps: true }
)

noteSch.plugin(AutoIncrement, {
  inc_field: 'ticket',
  id: 'ticketNums',
  start_seq: 500
})

module.exports = model('Note', noteSch)

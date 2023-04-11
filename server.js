require('dotenv').config()
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')

const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
// const {logEvents} = require('./middleware/logger')
const userRoutes = require('./routes/userRoutes')

const PORT = process.env.PORT || 3500

const app = express()
const { log, table } = console
connectDB()
log(`Process env: ${process.env.NODE_ENV}`)
// log(`Port: ${process.env.PORT}`)
// log(`DB URI: ${process.env.DATABASE_URI}`)

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))
app.use('/users', userRoutes)

app.all('*', (req, res) => {
  res.status(404)
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'))
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' })
  } else {
    res.type('txt').send('404 Not Found')
  }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
  log('Connected to MongoDB.')
  app.listen(PORT, () => log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
  log(err)
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

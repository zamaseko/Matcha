const express = require('express')
const path = require('path')
//const session = require('express-session')
const session = require('client-sessions')

//database connection
//const dbc = require('./models/connModel')

//init database
const db = require('./models/dbModel')
db.init()
//db.tables()

//init app
const app = express()
const port = 5000

//load view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//set public folder
app.use(express.static(path.join(__dirname, 'public')))

//enable cross origin resource sharing (for geolocation and chat)
const cors = require('cors')
app.use(cors())

//load body parser middleware
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//init session
const sess = require('./config/secret')
app.use(session(sess))
global.token = null
global.user = null

//init connection
const http = require('http').createServer(app)
io = require('socket.io')(http)
app.set('socket', io)

//init admin token
global.adminToken = null
global.distance = null

//routes
let index = require('./routes/index')
let signup = require('./routes/signup')
let login = require('./routes/login')
let logout = require('./routes/logout')
let verify = require('./routes/verify')
let forgotpassword = require('./routes/forgotpassword')
let profile = require('./routes/profile')
let visitors = require('./routes/visitors')
app.use('/', index)
app.use('/signup', signup)
app.use('/login', login)
app.use('/logout', logout)
app.use('/v', verify)
app.use('/f', forgotpassword)
app.use('/p', profile)
app.use('/visitors', visitors)

//admin routes
let admin = require('./routes/admin')
app.use('/admin', admin)

//start server
http.listen(port, (err, res) => {
		console.log(`server listening on port ${port}...`)
})

const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const { readdirSync } = require('fs')

const corsOptions = {
    // เปลี่ยน origin เป็น IP ของเครื่อง frontend
    origin: ['http://10.50.18.78:3000'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cors(corsOptions))



readdirSync('./routers')
.map((item)=> app.use('/api', require('./routers/'+ item)))

app.listen(3000, '0.0.0.0', () => {
    console.log('Start Sever on port 3000')
})
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const { readdirSync } = require('fs')

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cors())


readdirSync('./routers')
.map((item)=> app.use('/api', require('./routers/'+ item)))

app.listen(3000, () => {
    console.log('Start Sever on port 3000')
})
const router = require('express').Router()
const Guest = require('../models/guest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {SECRET_KEY} = process.env

//If a user provides a token, they are able to see all of the exclusive parties. If not, return a 401 Unauthorized message.

const requiresToken = function(req, res, next) {
  if 
}

router.get('/profile', (req, res, next) => {
  console.log('!!!!')
  next()
}, async (req, res, next) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = jwt.verify(token, SECRET_KEY)
    const guest = await Guest.findOne({ _id: payload.id }).select('-__v -password')

    const status = 200
    res.json({ status, guest })  
  } catch (e) {
    console.error(e)
    const error = new Error('You are not authorized to access this route.')
    error.status = 401
    next(error)
  }
})

router.post('/signup', async (req, res, next) => {
  status = 201
  try {
    const { username, password } = req.body
    const guest = await Guest.findOne({ username })
    if (guest) throw new Error(`User ${username} already exists`)

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const response = await Guest.create({
      username,
      password: hashedPassword
    })
    res.status(status).json({ status, response })
  } catch (e) {
    console.error(e)
    const error = new Error(`You can't come to this party.`)
    error.status = 400
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  status = 201
  try {
    const { username, password } = req.body
    // find user by username
    const guest = await Guest.findOne({ username })
    // if it doesnt exists, throw an error
    if (!guest) throw new Error(`Username could not be found`)

    // if it does exist, compare the plain text password to the hashed version
    const isValid = await bcrypt.compare(password, guest.password)
    // if validation fails, throw an error
    if (!isValid) throw new Error(`Password is not valid.`)

    // Create a JWT
    const payload = { id: guest._id } // set up payload
    const options = { expiresIn: '1 day' }
    const token = jwt.sign(payload, SECRET_KEY, options)

    // if all is well, responde with success message
    res.status(status).json({ status, token })
  } catch (e) {
    console.error(e)
    const error = new Error(`Login credentials incorrect.`)
    error.status = 400
    next(error)
  }
})

module.exports = router
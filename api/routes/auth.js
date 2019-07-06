const { SECRET_KEY } = process.env
const router = require('express').Router()
const bcrypt = require('bcrypt')
const Guest = require('../models/guest')
const { sign, verify } = require('jsonwebtoken')

const generateToken = (id) => {
  const payload = { id }
  const options = { expiresIn: '1 day' }
  return sign(payload, SECRET_KEY, options)
}

router.get('/profile', async (req, res, next) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = verify(token, SECRET_KEY)
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

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body
  const guest = await Guest.findOne({ username })
  if (guest) {
    const valid = await bcrypt.compare(password, guest.password)
    if (valid) {
      const status = 200
      const response = 'You have successful logged in.'
      const token = generateToken(guest._id)
      return res.status(status).json({ status, response, token })
    }
  }
  
  const message = `Username or password incorrect. Please check credentials and try again.`
  const error = Error(message)
  error.status = 401
  next(error)
})

router.post('/signup', async (req, res, next) => {
  const { username, password } = req.body
  const rounds = 10
  const hashed = await bcrypt.hash(password, rounds)

  const alreadyExists = await Guest.findOne({ username })
  if (alreadyExists) {
    const error = new Error(`Username '${username}' is already taken.`)
    error.status = 400
    
    return next(error)
  }
  
  const status = 201
  const guest = await Guest.create({ username, password: hashed })
  const token = generateToken(guest._id)
  res.status(status).json({ status, token })
})

module.exports = router
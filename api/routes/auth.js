
const { SECRET_KEY } = process.env
const router = require('express').Router()
const Guest = require('../models/guest')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

router.get('/profile', async (req, res, next) => {
  try {
    // Bearer is convention of how we send tokens
    // token value is split and taken from the array
    const token = req.headers.authorization.split('Bearer ')[1]
    // we use jwt to verify the token
    const payload = jsonwebtoken.verify(token, SECRET_KEY)
    // we find the guests information and return id and remove password
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


// POST /api/signup
router.post('/signup', async (req, res, next) => {
  const status = 201

  try {
    const { username, password } = req.body
    const guest = await Guest.findOne({ username })
    if (guest) throw new Error(`User already exists`)
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const response = await Guest.create({
      username,
      password: hashedPassword
    })
    res.status(status).json({ status, response })
  } catch (e)  {
    console.error(e)
    const error = new Error(`You can't come to this party`)
    error.status = 400
    next(error)
  }
})

// POST /login
router.post('/login', async (req, res, next) => {
  const status = 201

  try {
    const { username, password } = req.body

    // finds guest, if does not exist return error
    const guest = await Guest.findOne({ username })
    if (!guest) throw new Error(`User does not exist`)

    // compare the passwords, if they don't match return error
    const isValid = await bcrypt.compare(password, guest.password)
    if (!isValid) throw new Error(`Password is invalid.`)

    // create JWT when logged in
    const payload = { id: guest._id } // Set up payload
    const options = { expiresIn: '1 day' } // Sets expiration
    const token = jsonwebtoken.sign(payload, SECRET_KEY, options)

    // successful log in responds with token
    res.status(status).json({ status, token: token })
  } catch (e)  {
    console.error(e)
    const error = new Error(`You can't come to this party`)
    error.status = 401
    next(error)
  }
})

module.exports = router
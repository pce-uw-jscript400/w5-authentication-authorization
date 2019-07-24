
const router = require('express').Router()
const Guest = require('../models/guest')
const bcrypt = require('bcrypt')

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
    const guest = await Guest.findOne({ username })
    if (!guest) throw new Error(`User does not exist`)

    const isValid = await bcrypt.compare(password, guest.password)
    if (!isValid) throw new Error(`Password is invalid.`)

    res.status(status).json({ status, response: `You have been logged in.` })
  } catch (e)  {
    console.error(e)
    const error = new Error(`You can't come to this party`)
    error.status = 400
    next(error)
  }
})


module.exports = router
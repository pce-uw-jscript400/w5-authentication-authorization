const { SECRET_KEY } = process.env
const router = require('express').Router()
const Guest = require('../models/guest')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

router.get('/profile', async (req, res, next) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = jsonwebtoken.verify(token, SECRET_KEY)
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
  const status = 201
  try {
    const { username, password } = req.body
    const guest = await Guest.findOne({ username })
    if (guest) throw new Error (`${username} already exists`)
    const saltrounds = 12
    const hashPass = await bcrypt.hash(password, saltrounds)

    const response = await Guest.create({username, password: hashPass})

    res.status(status).json({ status, response })

  } catch (e) {
    console.error(e)
    const error = new Error('Unable to create a new user.')
    error.status = 422
    next(error)
  }  
  
})


router.post('/login', async (req, res, next) => {

  try {
    const { username, password } = req.body
    const guest = await Guest.findOne({ username })
    if (!guest) throw new Error('Username could not be found.')
    
    const isValid = await bcrypt.compare(password, guest.password)
    if (!isValid) throw new Error('Password is invalid.')


    // JWT Create
    const payload = { id: guest._id}
    const options = { expiresIn: '1 day'}
    const token = jsonwebtoken.sign(payload, SECRET_KEY, options)
    res.status(status).json({status, token})

    res.status(201).json({status, response: 'You have been logged in'})
  } catch (e) {
    console.error(e)
    const error = new Error('Login credentials incorrect')
    error.status = 400


  }


})

module.exports = router
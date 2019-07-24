const { SECRET_KEY } = process.env
const router = require('express').Router()
const Guest = require('../models/guest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

router.get('/profile', async (req, res, next) => {
  try {
    // get the JWT from the Authorization header
    const token = req.headers.authorization.split('Bearer ')[1]
    // Verify the token
    const payload = jwt.verify(token, SECRET_KEY)
    // Find the user that matches the JWT
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
  const { username, password } = req.body
  try {
    // check to see if a user already exists with that name
    const guest = await Guest.findOne({ username })

    // return an error if the user already exists
    if(guest !== null) {
      next({status: 400, message: 'username already exists'})
    } else {
      // if the user does not exist, hash the given password
      const hash = await bcrypt.hash(password, 12)
      // create a new user with the hashed password
      const response = await Guest.create({ username: req.body.username, password: hash })
      const payload = { id: response._id, username: response.username }
      const options = { expiresIn: '1 day' }
      const token = jwt.sign(payload, SECRET_KEY, options)
      res.status(status).json({ status, token })
    }
  } catch (e) {
    console.error(e)
    const error = new Error(`You can't come to this party`)
    error.status = 400
    next(error)
  }
})

router.post('/login', async (req, res, next) => { 
  const status = 200
  const { username, password } = req.body

  try {
    // find the user trying to log in
    const guest = await Guest.findOne({ username })
    
    // if the user is not found, return an error
    if(guest === null) {
      next({status: 401, message: 'username/password is incorrect'})
    } else {
      // if a user is found, compare the entered password with the stored password
      const isValid = await bcrypt.compare(password, guest.password)

      // if the passwords match, allow the login
      if(isValid) {
        const payload = { id: guest._id, username: guest.username }
        const options = { expiresIn: '1 day' }
        const token = jwt.sign(payload, SECRET_KEY, options)
        res.status(status).json({ 
          status: status, 
          message: 'You are now logged in',
          token: token
        })
      } else {
        next({status: 401, message: 'username/password is incorrect'})
      }
    }
  } catch (e) {
    console.error(e)
    const error = new Error(`You can't come to this party`)
    error.status = 400
    next(error)
  }
})

module.exports = router
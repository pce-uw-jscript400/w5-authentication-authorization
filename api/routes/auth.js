const router = require('express').Router()
const jwt = require('jsonwebtoken')
const Guest = require('../models/guest')
const bcrypt = require('bcrypt')

const { SECRET_KEY } = process.env

router.post('/signup', async (req, res, next) => {
    const status = 201
    try{
        const { username, password } = req.body
        const guest = await Guest.findOne({username})
        if (guest) throw new Error(`User ${username} already exists.`)
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const response = await Guest.create({
            username,
            password: hashedPassword
        })
        res.status(status).json({ status, response})
    } catch (e){
        console.error(e)
        const error = new Error(`You can't come to this party.`)
        error.status = 400
        next(error)
    }
  })

  router.post('/login', async(req, res, next) => {
      const status = 201
      try{
          const { username, password } = req.body
          //Find the user by username
          const guest = await Guest.findOne({ username })
          // If it doesn't exist, throw an error
          if (!guest) throw new Error('Username could not be found.')

          //if it does exist, compare the plain text password to the hashed version
          const isValid = await bcrypt.compare(password, guest.password)
          // If validation fails, throw and error
          if (!isValid) throw new Error('Password is invalid')

          const payload = { id: guest._id } // Setup payload
          const options = { expiresIn: '1 day'}
          const token = jtw.sign(payload, SECRET_KEY, options)
          // If all is well, respond with a success message
          res.status(status).json({ status, response: `You have been logged in.`})
      } catch (e){
          console.error(e)
          const error = new Error( `Login credentials incorrect.`)
          error.status = 400
          next(error)
      }
  })

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

  module.exports = router
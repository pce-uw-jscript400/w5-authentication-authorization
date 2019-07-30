const router = require('express').Router()
const Guest = require('../models/guest')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const { SECRET_KEY } = process.env

// router.get('/profile', isLoggedIn, isAdmin, async (req, res, next) => {
router.get('/profile', async (req, res, next) => {
  try {
    // If you're sending over the right header, it will split on the Bearer section
    // and grab the token
    const token = req.headers.authorization.split('Bearer ')[1]
    //  then create the payload by passing in the token and the secret key to JWT
    const payload = jsonwebtoken.verify(token, SECRET_KEY)
    // now we use the ID of that payload to make our request to Mongo
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
    const guest = await Guest.findOne({username})

    if (guest) throw new Error(('user exists'))

    const saltRounds = 10
    const hashedPW = await bcrypt.hash(password, saltRounds)
    const response = await Guest.create({
      username,
      password: hashedPW
    })

    const payload = { id: guest._id } // set up payload
    const options = { expiresIn: '1 day' } // sets expiration
    const token = jsonwebtoken.sign(payload, SECRET_KEY, options) // creates tokens

    res.status(status).json({ status, token })
  } catch (error) {
    const e = new Error('nope')
    e.status = 400
    next(e)
  }



})

router.post('/login', async (req, res, next) => {
  const status = 201

  try {

    const { username, password } = req.body
    const guest = await Guest.findOne({username})
    if (!guest) throw new Error('user not found')

    const isValid =  bcrypt.compare(password, guest.password)
    if (!isValid) throw new Error('pw not valid')

    const payload = { id: guest._id } // set up payload
    const options = { expiresIn: '1 day' } // sets expiration
    const token = jsonwebtoken.sign(payload, SECRET_KEY, options) // creates tokens

    // if it works, repsponds with success
    res.status(status).json({ status, token })
  } catch (error) {
    const e = new Error('nope')
    e.status = 400
    next(e)
  }
})

module.exports = router

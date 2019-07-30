const router = require('express').Router()
const Guest = require('../models/guest')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const {SECRET_KEY} = process.env

router.get('/profile', async (req, res, next) => {
  try {
    // get the token from the authorization header.
    const token = req.headers.authorization.split('Bearer ')[1]
    // Validate the JWT
    const payload = jsonwebtoken.verify(token, SECRET_KEY)
    // query the db for the user with the ID passed in the payload.
    const guest = await Guest.findOne({ _id: payload.id }).select('-__v -password')

    // If successful, return users information. 
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
    const {username, password} = req.body
    const userCheck = await Guest.findOne({username})
    if(userCheck) throw new Error(`Username is taken`)
    const hashedPw = await bcrypt.hash(password, 10)
    const response = await Guest.create({
      username,
      password: hashedPw
    })
    res.status(status).json({status, response})
    
  } catch (e) {
    console.error(e)
    const error = new Error ('New user creation failed')
    error.status = 400
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  const status = 200
  try {
    const {username, password} = req.body
    const user = await Guest.findOne({username})
    if (!user) throw new Error(`User ${username} could not be found`)
    
    const payload = { id: user._id }
    const options = { expiresIn: '1 day' }
    const token = jsonwebtoken.sign(payload, SECRET_KEY, options)

    const validated = bcrypt.compare(password, user.password)
    if (!validated) throw new Error(`Password incorrect`)

    res.status(status).json({
      status, 
      response: `User has been logged in`,
      token
    })
    
  } catch (e) {
    console.error(e)
    const error = new Error ('New user creation failed')
    error.status = 401
    next(error)
  }
})

module.exports = router
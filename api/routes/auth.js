const router = require('express').Router()
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const Guest = require('../models/guest')

const {SECRET_KEY} = process.env

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

// create a new route at `POST /api/signup` at `/api/routes/auth.js`. 
router.post('/signup', async (req, res, next) => {
  const status = 201
  // create a new `Guest`, pulling `username` and `password` 
  // from the request body
  try {
    const {username, password} = req.body

    // search to find that username
    // if found, send user message
    const guest = await Guest.findOne({username})
    if (guest) throw new Error(`User ${username} already exists.`)

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const response = await Guest.create({
      username, 
      password: hashedPassword
    })
    //  return a success message with the user's information (for now)
    res.status(status).json({status, response})
  } catch (e) {
    console.error(e)
    const error = new Error(`You can't come to this party.`)
    error.status = 400
    next(error)
  }
})

// Build a `POST /login` route that expects a username and password 
// in the request body. 
// Use the `bcrypt.compare()` function to compare 
// the incoming plain text password with the hashed password 
// stored in MongoDB. 
router.post('/login', async (req, res, next) => {
const status = 201
try {
  const {username, password } = req.body
  // Find the user by username
  const guest = await Guest.findOne({username})
  // if it doesn't exist, throw an error
  if (!guest) throw new Error(`Username could not be found.`)

  // If it does exist, compare the palin text password to the hashed version
  const isValid = await bcrypt.compare(password, guest.password)
  // If validation fails, throw an error
  if (!isValid) throw new Error(`Password is invalid.`)

  // create a JWT
  const payload = { id: guest._id } // set up payload
  const options = { expiresIn: '1 day' }
  const token = jsonwebtoken.sign(payload, SECRET_KEY, options)
  // If all is well, response with a success message
  // Respond with the token when a user successfully is able to login
  res.status(status).json({status, token})
  } catch (e) {
  console.error(e)
  const error = new Error(`Login credential incorrect.`)
  error.status = 401
  next(error)
  }
})

module.exports = router



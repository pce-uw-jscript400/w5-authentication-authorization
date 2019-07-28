const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Guest = require('../models/guest')

const { SECRET_KEY } = process.env

router.get('/profile', async (req, res, next) => {
    try {
        // get the authorization header
        const token = req.headers.authorization.split('Bearer ')[1]
        // verify the token against the secret key
        const payload = jwt.verify(token, SECRET_KEY)
        // get the user information for the user ID (minus the password!)
        const guest = await Guest.findOne({ _id: payload.id }).select('-__v -password')

        // return the user information
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
        if (guest) throw new Error(`User ${username} already exists.`)

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const response = await Guest.create({
            username,
            password: hashedPassword
        })
        res.status(status).json({ status, response })
    }
    catch(e) {
        console.error(e)
        const error = new Error(`You can't come to this party.`)
        error.status = 400
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    const status = 201
    try {
        const { username, password } = req.body
        // Find the user by username
        const guest = await Guest.findOne({ username })
        // if it doesn't match, throw an error
        if (!guest) throw new Error('Username not found')

        // compare the plain text password to the hashed version
        const compare = await bcrypt.compare(password, guest.password)
        // if validation fails, throw an error
        if (!compare) throw new Error('Password is invalid.')

        // JWT stuff
        // user data
        const payload = { id: guest._id }
        // set token expiration
        const options = { expiresIn: '1 day' }
        // the full token, including secret (signature)
        const token = jwt.sign(payload, SECRET_KEY, options)

        // if validation succeeds, send success message
        res.status(status).json({ status, token })
    }
    catch(e) {
        console.error(e)
        const error = new Error(`Invalid username or password.`)
        error.status = 401
        next(error)
    }
})


module.exports = router
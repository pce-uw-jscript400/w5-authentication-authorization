const router = require('express').Router()
const bcrypt = require('bcrypt');
const { sign, verify } = require('jsonwebtoken');
const Guest = require('../models/guest')
const { SECRET_KEY } = process.env

const generateToken = (id) => {
    const payload = { id }
    const options = { expiresIn: '1 day' }
    return sign(payload, SECRET_KEY, options)
}

router.get('/profile', async (req, res, next) => {
    try {
        //Get the token from the authorization header
        const token = req.headers.authorization.split('Bearer ')[1]
        //Get the payload, in particular the guest id
        const payload = verify(token, SECRET_KEY)
        //Get all infomration about the user from the database, minus the password
        const guest = await Guest.findOne({ _id: payload.id }).select('-__v -password')

        const status = 200
        res.json({ status, guest })
    } catch (e) {
        //If anything at all goes wrong, we can not authorize the user.  Better safe than sorry.
        console.error(e)
        const error = new Error('You are not authorized to access this route.')
        error.status = 401
        next(error)
    }
})

router.post('/signup', async (req, res, next) => {
    const status = 201
    const { username, password } = req.body
    const saltRounds = 10
    const alreadyExists = await Guest.findOne({ username })
 
    if (alreadyExists) {
        const error = new Error(`Username '${username}' is already taken.`)
        error.status = 400
        return next(error)
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const guest = await Guest.create({
            username: username,
            password: hashedPassword
        })
        const token = generateToken(guest._id)
        res.status(status).json({ status, token })
    } catch (error) {
        console.log(error)
        if (error.name === 'ValidationError') {
            res.status(400).json({ status: 400, response: error.message })
        } else {
            res.status(500).json({ status: 500, response: error.message })
        }
    }
})

router.post('/login', async (req, res, next) => {
    const status = 200
    try {
        const { username, password } = req.body;
        
        //See if the username exists
        const guest = await Guest.findOne({ username })
        if (!guest) {
            //The username does not exist
            throw new Error(`Username could not be found`)
        }
        
        //Given that the username exists, see if the password matches
        const isValid = await bcrypt.compare(password, guest.password)
        if (!isValid) {
            //The username exists but the password is wrong
            throw new Error(`Password is invalid`)
        }
        //Give the user a token that they can use for future use of APIs.
        const token = generateToken(guest._id)
        res.status(status).json({ status, token })
    } catch (error) {
        console.error(error)
        //Give an undetailed message to make it harder for hackers
        const err = new Error(`Login credentials incorrect.`)
        err.status = 401
        next(err)
    }
})

module.exports = router
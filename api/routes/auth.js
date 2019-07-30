const router = require('express').Router()
const bcryt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const Guest = require('../models/guest')

const {
    SECRET_KEY
} = process.env

router.get('/profile', async (req, res, next) => {
    try {
        const token = req.headers.authorization.split('Bearer ')[1]
        console.log(token)
        const payload = jsonwebtoken.verify(token, SECRET_KEY)
        const guest = await Guest.findOne({
            _id: payload.id
        }).select('-__v -password')

        const status = 200
        res.json({
            status,
            guest
        })
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
        const {
            username,
            password
        } = req.body
        const guest = await Guest.findOne({
            username
        })
        if (guest) throw new Error(`User ${username} already exists.`)

        const saltRounds = 10
        const hashedPassword = await bcryt.hash(password, saltRounds)
        const response = await Guest.create({
            username,
            password: hashedPassword
        })
        res.status(status).json({
            status,
            response
        })
    } catch (e) {
        console.error(e)
        const error = new Error(`You can't come to this party!`)
        error.status = 400
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    const status = 201
    try {
        const {
            username,
            password
        } = req.body
        // Find user by username
        const guest = await Guest.findOne({
            username
        })
        //  
        const payload = {
            id: guest._id
        } // Set up payload
        const options = {
            expiresIn: '1 day'
        } // Sets expiration
        const token = jsonwebtoken.sign(payload, SECRET_KEY, options)

        // console.log(guest)
        // If it doesn't exist, throw an error
        if (!guest) throw new Error(`User could not be found.`)

        // If it does exist, compare the plain text to password to the hashed verion.
        const isValid = await bcryt.compare(password, guest.password)
        // If validation fAILS, throw an error
        if (!isValid) throw new Error(`Password is invalid`)

        // If all is well, respone with a success message
        res.status(status).json({
            status,
            token,
            response: `You have been logged in.`
        })
    } catch (e) {
        console.error(e)
        const error = new Error(`Login credentials incorrect`)
        error.status = 400
        next(error)
    }
})

module.exports = router
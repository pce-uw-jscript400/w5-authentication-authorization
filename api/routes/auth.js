const router = require('express').Router()
const Guest = require('../models/guest')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const saltRounds = 10
const { SECRETKEY } = process.env

router.post('/signup', async(req, res, next) => {
    const status = 201
    try {
        const { username, password } = req.body
            // check if guest is already in database
        const guest = await Guest.findOne({ username })
        if (guest) throw new Error('Already user')
            // create hashed passsword
        const hashedPassword = await bcrypt.hash(password, saltRounds)
            //create user entry
        guest = await Guest.create({ username, password: hashedPassword })
            // set up token details to create login for newly created user
        const payload = { id: guest._id }
        const options = { expiresIn: '1 day' }
            // create token for user
        const token = jsonwebtoken.sign(payload, SECRETKEY, options)
        const response = token
        res.status(status).json({ status, response })
    } catch {
        console.error(e)
        const error = new Error(`Can't come to party`)
        error.status = 400
        next(error)
    }


})

router.get('/profile', async(req, res, next) => {
    try {
        // seperate token from header
        const token = req.headers.authorization.split('Bearer ')[1]
            //extract data from token
        const payload = jsonwebtoken.verify(token, SECRET_KEY)
            //check to see if id extracted from token is in the database   
        const guest = await Guest.findOne({ _id: payload.id }).select('-__v -password')
            //return guest information
        const status = 200
        res.json({ status, guest })
    } catch (e) {
        console.error(e)
        const error = new Error('You are not authorized to access this route.')
        error.status = 401
        next(error)
    }
})

router.post('/login', async(req, res, next) => {
    const status = 201
    try {
        const { username, password } = req.body
            //check for guest in database
        const guest = await Guest.findOne({ username })
        if (!guest) throw new Error('User not found')
            // check password validity
        const isValid = await bcrypt.compare(password, guest.password)
        if (!isValid) throw new Error('Could not login')
            //create auth token
        const payload = { id: guest._id }
        const options = { expiresIn: '1 day' }
        const token = jsonwebtoken.sign(payload, SECRETKEY, options)
            //return token to user
        res.status(status).json({ status, token })
    } catch (e) {
        console.error(e)
        const error = new Error('Credentals incorrect')
        error.staus = 401

    }
})

module.exports = router
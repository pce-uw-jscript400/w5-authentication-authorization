const router = require('express').Router()
const Guest = require('../models/guest')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env
// var token = jwt.sign({ foo: 'bar' }, 'shhhhh');

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
        const guest = await Guest.findOne({ username})
        if (guest) throw new Error (`User already exists.`)

        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const response = await Guest.create({
            username,
            password: hashedPassword
        })

        const payload = { id: guest._id }
        const options = { expiresIn: '1 day' }
        const token = jwt.sign(payload, SECRET_KEY, options)

        res.json({ status, token })    } catch (e) {
        console.error(e)
        const error = new Error ('You can\'t come to this party')
        error.status = 400
        next(error)
    }
})


router.post('/login', async (req, res, next) => {
    const status = 201
    try {
        const { username, password } = req.body
        const guest = await Guest.findOne({ username})
        if (!guest) throw new Error (`Login credentials incorrect.`)
        
        // If username does exist, compare the plain text password the the hashed version
        const isValid = await bcrypt.compare(password, guest.password)
        if (!isValid) throw new Error(`Login credentials incorrect.`)

        const response = await Guest.create({
            username,
            password: hashedPassword
        })

        const payload = { id: guest._id }
        const options = { expiresIn: '1 day' }
        const token = jwt.sign(payload, SECRET_KEY, options)

        res.json({ status, token })
    } catch (e) {
        console.error(e)
        const error = new Error ('Login credentials incorrect')
        error.status = 401
        next(error)
    }
})


module.exports = router
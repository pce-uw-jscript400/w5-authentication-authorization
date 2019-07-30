const { SECRET_KEY } = process.env
const router = require('express').Router()
const Guest = require('../models/guest')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

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
    
    try{
        
        const {username, password} = req.body
        const guest = await Guest.findOne({username})
        if ( guest ) throw new Error(`User: ${username} already exists`)
        const saltRounds = 10
        const hashed = await bcrypt.hash(password, saltRounds)
        const response = await Guest.create({
            username,
            password: hashed
        })
        res.status(status).json({status, response})
    } catch (e) {
        console.error(e)
        const error = new Error(`You can't come to this party`)
        error.status = 400
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    const status = 201
    try {
        const { username, password } = req.body
        //search for the user
        const guest = await Guest.findOne({username})
        //if the username doesn't exist, throw an error
        if (!guest) throw new Error(`Username could not be found.`)
        //make sure the password is valid
        const isValid = await bcrypt.compare(password, guest.password)
        //if it's not, throw an error
        if(!isValid) throw new Error(`password is invalid`)
        //return success
        const payload = { id: guest._id } //setup payload
        const options = { expiresIn: '1 day' } //add expiration
        const token = jsonwebtoken.sign(payload, SECRET_KEY, options) //create token
        res.status(status).json({status, token})

    } catch (e) {
        console.error(e)
        const error = new Error(`login credentials incorrect`)
        error.status = 401
        next(error)
    }

})

module.exports = router 
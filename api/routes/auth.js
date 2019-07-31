const router = require('express').Router()
const Guest = require('../models/guest')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

const {SECRET_KEY} = process.env;

const saltRounds = 10;

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

router.post('/signup', async (req, res, next) =>{
    var status = 201;
    try {
        const {username, password} = req.body;
        var user = await Guest.findOne({username});        
        if (user)
        {
            throw new Error('User already exists');
        }        
        var hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        req.body.password = hashedPassword
        const response = await Guest.create({username, password: hashedPassword});
        res.status(status).json({status, response})
    }
    catch(err){
        console.error(err);
        const error  = new Error('You cant come to this party.')
        error.status = 400
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    var status = 201;
    
    try{
        const {username, password} = req.body;
        var guest = await Guest.findOne({username})
        if (!guest)
        {
           throw new Error('User not found')
        }

        const isValid = await bcrypt.compare(password, guest.password)
        if (!isValid) throw new Error('Password is invalid');

        const payload = { id: guest._id } // Set up payload
        const options = { expiresIn: '1 day' } // Set up expiration
        const token = jsonwebtoken.sign(payload, SECRET_KEY , options)
        res.status(status).json({status, token})
    }
    catch(err){
        console.error(err);
        const error  = new Error('Login creds incorrect.')
        error.status = 400
        next(error)
    }
})

module.exports = router
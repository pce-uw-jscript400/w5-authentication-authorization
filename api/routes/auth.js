const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Guest = require('../models/guest')
const { SECRET_KEY } = process.env

router.get('/profile', async (req, res, next) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = jwt.verify(token, SECRET_KEY)
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
    let userExists = false
    try{
      const{username, password} = req.body
      const guest = await Guest.findOne({username})
      if(guest){
        userExists = true
        throw new Error('That username is already taken')
      }
        
      const salt = 10
      const bcryptPassword = await bcrypt.hash(req.body.password, salt)
        const response = await Guest.create({
          username:req.body.username, 
          password:bcryptPassword
      })
        res.status(status).json({ status, response })
    }catch(error){
        console.log(error.message)
        const message = `Whoops something went wrong - please try again!`
        const e = new Error()
        if(userExists === true){
          e.message = error.message
          e.status = 422
        }else{
          e.message = message
          e.status = 418
        }
        next(e)
    }
  })
  router.post('/login',async (req,res,next)=>{
    const status = 201
    const{username, password}=req.body
    let userFound = false
    let correctPassword = false
    try{
      const guest = await Guest.findOne({username})
      if(!guest){
        throw new Error('Did you type in the right user name?')
      }
      userFound = true
      const validPassword = await bcrypt.compare(password, guest.password)
      if(!validPassword){
        correctPassword = false
        throw new Error('Whoops looks like you typed in incorrect credentials')
      }

      //create token
      const payload = { id: guest._id }
      const options = { expiresIn: '1 day' }
      const token = jwt.sign(payload, SECRET_KEY, options)

      res.status(status).json({status, token})

    }catch(error){
      const e = new Error()
      if(!userFound || !correctPassword){
        e.message = error.message
        e.status = 400
      }else{
        e.message = `Whoops something went wrong - please try again!`
        e.status = 418
      }
      next(e)
    }
  })

module.exports = router
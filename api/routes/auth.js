const { SECRET } = process.env
const router = require('express').Router()
const Party = require('../models/party')
const Guest = require('../models/guest')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


router.get('/profile', async (req, res, next) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = jwt.verify(token, SECRET)
    const guest = await Guest.findOne({ _id: payload.id }).select('-__v -password')

    const status = 200
    const message = `You are ALLOWED to view this profile!`
    res.json({ status, message, guest })

  }catch (e) {
    console.error(e)
    const error = new Error('You are not authorized to access this route.')
    error.status = 401
    next(error)
  }
})


router.post('/signup', async (req, res, next) => {
  try{

    const {username, password} = req.body
    const rounds = 10
    const hashed = await bcrypt.hash(password, rounds)

    const exists = await Guest.findOne({ username })

    if (exists) {
      const error = new Error(`Username '${username}' is already taken.`)
      error.status = 400

      return next(error)
    }

    const status = 201
    const guest = await Guest.create({ username, password: hashed })

    const payload = { id: guest._id }
    const options = { expiresIn: '1 day' }
    const token = jwt.sign(payload, SECRET, options)


    res.status(status).json({ status, token })

  }catch(e){
    console.error(e)
    const err = new Error('You are not authorized to access this route.')
    err.status = 401
    next(err)
  }


})



router.post('/login', async (req, res, next) => {


  try{
    const status = 201

    const {username, password} = req.body

    const guest = await Guest.findOne({username})
    if(!guest) throw new Error(`Username could not be found.`)

    const isValid = await bcrypt.compare(password, guest.password)
    if(!isValid) throw new Error(`Password is invalid`)

    const payload = { id: guest._id }
    const options = { expiresIn: '1 day' }
    const token = jwt.sign(payload, SECRET, options)

    const message = `You have successfully logged in.`

    res.status(status).json({status, message, token})

  }catch(e){
    console.error(e)
    const error = new Error(`Login credentials incorrect`)
    error.status = 401
    next(e)
  }
    // Guest.findOne({username})
    // .then((user) => {
    //   if(!user){
    //     throw new Error("User doesn't exists")
    //   }
    //
    //   console.log(user)
    //
    //   bcrypt.compare(password, user.password, (err, response) => {
    //       res.json({message: "You have successfully logged in."})
    //   });
    //
    // })
    // .catch((e) => {
    //   console.error(e)
    //   const error = new Error(`Something went bad.`)
    //   next(e)
    // })



})



module.exports = router

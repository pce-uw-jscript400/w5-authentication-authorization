const router = require('express').Router()
const Guest = require('../models/guest')
const Party = require('../models/party')
const jwt = require('jsonwebtoken')

const {SECRET_KEY} = process.env

router.get('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = jwt.verify(token, SECRET_KEY)
    const guest = await Guest.findOne({ _id: payload.id }).select('-__v -password')
    let parties
    console.log(guest)
    if (guest){
      let parties = await Party.find().select('-__v')
      console.log("you have access")
      console.log(parties)
    } else {
      console.log("you dont have access")
      let parties = await Party.find().select('false')
    }
  
    const status = 200 // success status
    res.status(status).json({ status, parties })
  } catch (e) {
    console.error(e)
    const error = new Error('You are not authorized to access this route.')
    error.status = 401
    next(error)
  }
})

router.get('/exclusive', async (req, res, next) => {
  const status = 200
  const response = await Party.findOne({ exclusive: true }).select('-__v')

  res.json({ status, response })
})

router.get('/:id', async (req, res, next) => {
  const status = 200
  const response = await Party.findOne({ _id: req.params.id }).select('-__v')

  res.json({ status, response })
})


module.exports = router
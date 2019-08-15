const router = require('express').Router()
const Party = require('../models/party')
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env

const validateToken = async (req, res, next, error) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1]
    if (!token) {
      throw new Error(`No token provided`)
    } else {
      const payload = jsonwebtoken.verify(token, SECRET_KEY)
      const validGuest = Guest.findOne({ _id: payload.id })
        .select('-__v -password')
      next (validGuest)    
    }
  } catch (e) {
    console.error(e)
    const error = (e)
    error.status = 401
    next(error)
  }
}

router.get('/', validateToken, async (req, res, next) => {
  const status = 200
  try {
    const response = await Party.find().select('-__v')
    res.json({ status, response })
  } catch {
    const response = await Party.find({exclusive: false}).select('-__v')
    res.json({ status, response, message })
  }
})

router.get('/exclusive', validateToken, async (req, res, next) => {
  const status = 200
  try {
    const response = await Party.find({ exclusive: true }).select('-__v')
    res.json({ status, response })
  } catch {
    const message = 'Invalid token'
    console.log(message)
    const response = await Party.find({exclusive:false}).select('-__v')
    res.json({ status, response, message })

  }
})

router.get('/:id', validateToken, async (req, res, next) => {
  const status = 200
  try {
    const response = await Party.findOne({ _id: req.params.id }).select('-__v')
    res.json({ status, response })
  } catch {
    const error = new Error('You are not authorized to access this route.')
    error.status = 401
    next(error)
  }})


module.exports = router
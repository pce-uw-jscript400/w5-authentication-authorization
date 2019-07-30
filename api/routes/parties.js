const router = require('express').Router()
const Party = require('../models/party')
const jsonwebtoken = require('jsonwebtoken')
const {SECRET_KEY} = process.env

router.get('/', async (req, res, next) => {
  try {
    const status = 200
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = jsonwebtoken.verify(token, SECRET_KEY)
    const response = await Party.find().select('-__v')
    res.json({ status, response })
  } catch (e) {
    const status = 206 // for partial success
    const response = await Party.find({exclusive: false}).select('-__v')
    res.json({status, response})
  }
})

router.get('/exclusive', async (req, res, next) => {
  try {
    const status = 200
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = jsonwebtoken.verify(token, SECRET_KEY)
    const response = await Party.findOne({ exclusive: true }).select('-__v')

    res.json({ status, response })
  } catch (e) {
    console.error(e)
    const error = new Error('You are not authorized to access this route.')
    error.status = 401
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const status = 200
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = jsonwebtoken.verify(token, SECRET_KEY)
    const response = await Party.findOne({ _id: req.params.id }).select('-__v')
    res.json({ status, response })
  } catch (e) {
    console.error(e)
    const error = new Error('You are not authorized to access this route.')
    error.status = 401
    next(error)
  }
})


module.exports = router
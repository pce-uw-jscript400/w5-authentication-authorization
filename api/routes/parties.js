const router = require('express').Router()
const Party = require('../models/party')
const { SECRET_KEY } = process.env
const jsonwebtoken = require('jsonwebtoken')

router.get('/', async (req, res, next) => {
  const status = 200
  try {
    let response
    if (req.headers.authorization) {
      const token = req.headers.authorization.split('Bearer ')[1]
      const payload = jsonwebtoken.verify(token, SECRET_KEY)
      response = await Party.find().select('-__v')
    } else {
      response = await Party.find({ exclusive: false }).select('-__v')
    }
    res.json({ status, response })
  } catch (e) {
    console.error(e)
    const error = new Error('Something went wrong.')
    error.status = 400
    next(error)
  }
})

router.get('/exclusive', async (req, res, next) => {
  try {
    const status = 200
    const token = req.headers.authorization.split('Bearer ')[1]
    jsonwebtoken.verify(token, SECRET_KEY)
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
  const status = 200
  try {
    const party = await Party.findOne({ _id: req.params.id }).select('-__v')
    const isExclusive = party.exclusive
    if (!isExclusive) {
      res.json({ status, party })
    } else {
      const token = req.headers.authorization.split('Bearer ')[1]
      jsonwebtoken.verify(token, SECRET_KEY)
      res.json({ status, party })
    }
  } catch (e) {
    console.error(e)
    const error = new Error('Something went wrong.')
    error.status = 400
    next(error)
  }
})


module.exports = router
const router = require('express').Router()
const Party = require('../models/party')
const jsonwebtoken = require('jsonwebtoken')
const Guest = require('../models/guest')

const {
  SECRET_KEY
} = process.env

router.get('/', async (req, res, next) => {
  const status = 200
  try {
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = jsonwebtoken.verify(token, SECRET_KEY)
    const response = await Party.find().select('-__v')
    res.json({
      status,
      response
    })
  } catch (e) {
    const response = await Party.find({
      exclusive: false
    }).select('-__v')
    res.json({
      status,
      response
    })
  }
})

router.get('/exclusive', async (req, res, next) => {
  try {
    const status = 200
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = jsonwebtoken.verify(token, SECRET_KEY)
    const response = await Party.find({
      exclusive: true
    }).select('-__v')
    res.json({
      status,
      response
    })
  } catch (e) {
    const error = new Error(`Not authorized to view parties.`)
    error.status = 401
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const status = 200
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = jsonwebtoken.verify(token, SECRET_KEY)
    const party = await Party.findOne({
      _id: req.params.id
    }).select('-__v')
    console.log(party.exclusive)
    if (payload && party.exclusive) {
      const response = party
      res.json({
        status,
        response
      })
    } else if (!payload && !party.exclusive) {
      const response = await Party.find({
        exclusive: false
      }).select('-__v')
      res.json({
        status,
        response
      })
    }
  } catch (e) {
    const error = new Error(`Not authorized to view this party.`)
    error.status = 401
    next(error)
  }
})


module.exports = router
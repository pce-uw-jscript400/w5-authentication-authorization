const router = require('express').Router()
const Party = require('../models/party')
const validateToken = require('../helpers/validate')
const jsonwebtoken = require('jsonwebtoken')

router.get('/', async (req, res, next) => {
  const status = 200
  const response = await Party.find().select('-__v')
  
  res.json({ status, response })
})

router.get('/exclusive', validateToken, async (req, res, next) => {
  const status = 200
  const response = await Party.findOne({ exclusive: true }).select('-__v')

  res.json({ status, response })
})

router.get('/:id', async (req, res, next) => {
  const status = 200
  const token = req.headers.authorization.split('Bearer ')[1]
  if (token) {
    try {
      const payload = jsonwebtoken.verify(token, SECRET_PASSWORD)
      const response = await Party.findOne({ _id: req.params.id }).select('-__v')
    } catch (e) {
      console.error(e)
      const error = new Error(e.message)
      error.status = 401
      return next(error)
    }
  } else {
    const response = await Party.findOne({ _id: req.params.id }).select('-__v')
    if (response.exclusive) {
      const error = new Error(`You are not authorized`)
      error.status = 401
      return next(error)
    }
  }
  

  res.json({ status, response })
})


module.exports = router
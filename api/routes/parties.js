const router = require('express').Router()
const Party = require('../models/party')
const validateToken = require('../helpers/validate')


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
  const response = await Party.findOne({ _id: req.params.id }).select('-__v')

  res.json({ status, response })
})


module.exports = router
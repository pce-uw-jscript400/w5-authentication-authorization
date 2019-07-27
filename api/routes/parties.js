const router = require('express').Router()
const Party = require('../models/party')

router.get('/', async (req, res, next) => {
  const status = 200
  const response = await Party.find().select('-__v')

  res.json({ status, response })
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
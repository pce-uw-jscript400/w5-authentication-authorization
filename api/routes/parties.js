const router = require('express').Router()
const Party = require('../models/party')

const isValid = (req, res, next) => {
    try {
      const token = req.headers.authorization.split('Bearer ')[1]
      const payload = jsonwebtoken.verify(token, SECRET_KEY)
    } catch (e) {
      console.error(e)
      const error = new Error(`you haven't given me a token!`)
      error.status = 401
      return next(error)
    }
    next()
}


router.get('/', async (req, res, next) => {
  const status = 200
  const response = await Party.find().select('-__v')
  
  res.json({ status, response })
})

router.get('/exclusive', isValid, async (req, res, next) => {
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
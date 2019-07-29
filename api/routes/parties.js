const router = require('express').Router()
const Party = require('../models/party')
const { sign, verify } = require('jsonwebtoken')
const { SECRET_KEY } = process.env
const Guest = require('../models/guest')

router.use(async (req, res, next) => {
  try{
    delete req.guest
    const token = req.headers.authorization.split('Bearer ')[1]
    const payload = verify(token, SECRET_KEY)
    const guest = await Guest.findOne({ _id: payload.id }).select('-__v -password')
    if(guest){
      req.guest = guest
    }
  }finally{
    next()
  }
})

router.get('/', async (req, res, next) => {
  const status = 200
  let response = await Party.find().select('-__v')
  if(!req.guest){
    response = response.filter(function(party, index, arr){
      return party.exclusive == false
    })
  }
  res.json({ status, response })
})

router.get('/exclusive', async (req, res, next) => {
  const status = 200
  let response
  if(req.guest){
    response = await Party.find({ exclusive: true }).select('-__v')
    res.status(status).json({ status, response })
  }else{
    res.status(401).json( {status: 401, response: "Unauthorized" })
  }
})

router.get('/:id', async (req, res, next) => {
  const status = 200
  const response = await Party.findOne({ _id: req.params.id }).select('-__v')
  if(!req.guest){
    if(response.exclusive){
      res.status(401).json( {status: 401, response: "Unauthorized" })
    }
  }
  res.json({ status, response })
})


module.exports = router
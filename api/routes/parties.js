const router = require('express').Router()
const { SECRET_KEY } = process.env
const jsonwebtoken = require('jsonwebtoken')
const Guest = require('../models/guest')
const Party = require('../models/party')

router.get('/', async (req, res, next) => {
  const status = 200

  validToken = tokenValidate(req);
  
  if (validToken){
     response = await Party.find().select('-__v')
  } else {
     response =  Party.filter()(function(arr){
       return arr[key]
     })
  }


  res.json({ status, response })
})

function tokenValidate(req) {
  const token = req.headers.authorization.split('Bearer ')[1]
  const payload = jsonwebtoken.verify(token, SECRET_KEY)
  const validToken = Guest.findOne({ _id: payload.id }).select('-__v -password')

  return validToken
}

router.get('/exclusive', async (req, res, next) => {
try {
  const status = 200
  //Validate token in a reusable function
  validToken = tokenValidate(req);
  

  if (validToken) {
    const response = await Party.findOne({ exclusive: true }).select('-__v')

    res.json({ status, response })
  } 
} catch (e) {
    console.error(e)
    const error = new Error('You are not authorized to access this route.')
    error.status = 401
    next(error)  
 }
})

router.get('/:id', async (req, res, next) => {
  const status = 200
  const response = await Party.findOne({ _id: req.params.id }).select('-__v')

  res.json({ status, response })
})


module.exports = router
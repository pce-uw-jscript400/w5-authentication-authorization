const router = require('express').Router()
const Party = require('../models/party')
const Guest = require('../models/guest')
const helper = require('../helper/authorize')

router.get('/', helper.parties, async (req, res, next) => {

  if(helper.parties){
    console.log('Its true')
    const status = 200
    const response = await Party.find().select('-__v')

    return res.json({ status, response })
  }


    const status = 401
    const response = await Party.findOne({ exclusive: false }).select('-__v')
    return res.status(status).json({ status, response })


})



router.get('/exclusive', helper.exclusive, async (req, res, next) => {
  if(helper.exclusive){
      console.log('EXCLUSIVES ONLY!')
      const status = 200
      const response = await Party.findOne({ exclusive: true }).select('-__v')

      return res.json({ status, response })
  }

  const status = 401
  const message = `Unauthorized access`
  return res.status(status).json({ status, message })

})





router.get('/:id', async (req, res, next) => {
  const status = 200
  const response = await Party.findOne({ _id: req.params.id }).select('-__v')

  res.json({ status, response })
})


module.exports = router

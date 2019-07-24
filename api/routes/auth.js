const router = require('express').Router()
const Guest = require('../models/guest')

router.post('/', async (req, res, next) => {
    const status = 201
    try{
        const response = await Guest.create(req.body)
        res.status(status).json({ status, response})
    } catch (e){
        console.error(e)
        const error = new Error(`You can't come to this party.`)
        error.status = 400
        next(error)
    }
  })

  module.exports = router
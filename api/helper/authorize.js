const { SECRET } = process.env
const jwt = require('jsonwebtoken')

const exclusive = (req, res, next) => {
  const error = { status: 401, message: 'You are NOT authorized to be here!' }
  if(!req.headers.authorization) next(error)

  const token = req.headers.authorization.split('Bearer ')[1]

  const payload = jwt.verify(token, SECRET)
  if(!payload) next(error)

  next()
}


//This may not be correct - I need to ask about this in class
const parties = (req, res, next) => {
  const error = { status: 401, message: 'You are NOT authorized to be here - PARTIES!' }
  if(!req.headers.authorization){
    next()
  }else{
    const token = req.headers.authorization.split('Bearer ')[1]

    const payload = jwt.verify(token, SECRET)
    if(!payload) next(error)

    next()

  }


}

module.exports = { exclusive, parties }

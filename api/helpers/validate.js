const jsonwebtoken = require('jsonwebtoken')
const SECRET_KEY = process.env

const validateToken = async (req, res, response) => {
    try {
        //make sure token exists
        const token = req.headers.authorization.split('Bearer ')[1]
        if (!token) throw new Error(`No token provided`)
        //verify it
        const payload = jsonwebtoken.verify(token, SECRET_KEY)
    } catch (e) {
        e.status = 401
        return next(e)
    }

    //continue
    next()
}

module.exports = validateToken
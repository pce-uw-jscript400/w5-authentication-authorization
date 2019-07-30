const { SECRET_KEY } = process.env;
var jsonwebtoken = require('jsonwebtoken');
const router = require('express').Router();
const Guest = require('../models/guest');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
  const payload = { id }
  const options = { expiresIn: '1 day' }
  return sign(payload, SECRET_KEY, options)
}


//TODO: why is this 404 not found now???
router.get('/profile', async (req, res, next) => {
    try {
      const token = req.headers.authorization.split('Bearer ')[1]
      const payload = jsonwebtoken.verify(token, SECRET_KEY)
      const guest = await Guest.findOne({ _id: payload.id }).select('-__v -password')
      console.log('token', token);

      const status = 200
      res.json({ status, guest })  
    } catch (e) {
        console.error(e)
        const error = new Error('You are not authorized to access this route.')
        error.status = 401
        next(error)
    }
  })    

router.post('/signup', async (req, res, next) =>  {
    const status = 201;
    
    try {  
        const { username, password } = req.body;
        const user = await Guest.findOne({ username });
        if(user) throw new Error(`This username ${username} is already taken`);

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const guest = await Guest.create({
            username, 
            password: hashedPassword
        });


        // // creates a payload which is the data being transmitted in the JSON object
        const payload = { id: guest._id }
        // //adds some JWT options about how to handle the web token
        const options = { expiresIn: '1 day' }
        // //creates the jwt
        const token = jsonwebtoken.sign(payload, 'SECRET_KEY', options)       
        

        res.json({ status, token });
    } catch (e) {
        console.error(e);   
        const error = new Error('Not on the guest list');
        error.status = 400;
        next(error);
    } 
});

router.post('/login', async(req, res, next) => {
    const status = 201;

    try {
        const { username, password } = req.body;
        //Get user with the entered username
        //if no match, send error
        const guest = await Guest.findOne({ username });
        if(!guest) throw new Error(`Login credentials are incorrect`);
        
        //Compare the pwd hash in dB with that provided
        //if they don't match, send error
        const isPwdCorrect = await bcrypt.compare(password, guest.password);
        if(!isPwdCorrect) throw new Error(`Login credentials are incorrect`);

        //creates a payload which is the data being transmitted in the JSON object
        const payload = { id: guest._id }
        //adds some JWT options about how to handle the web token
        const options = { expiresIn: '1 day' }
        //creates the jwt
        const token = jsonwebtoken.sign(payload, 'SECRET_KEY', options)       

        //Log success
        const successMsg = 'You have successfully logged in!';

        res.json({ status, token });

    } catch(e) {
        console.error(e);
        const error = new Error(`Login credentials are incorrect`);
        error.status = 400;
        next(error);
    }
});
module.exports = router;

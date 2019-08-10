const router = require("express").Router();
const Guest = require("../models/guest");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const { SECRET_KEY } = process.env;

//GET
// http://localhost:5000/api/profile


router.get('/profile', async (req, res, next) => {
  try {
    // Check the Authorization Header for the Bearer token, split out the token
    const token = req.headers.authorization.split('Bearer ')[1]
    // Use jsonwebtoken package to verify that the token is sending the correct secret key in the signature
    const payload = jsonwebtoken.verify(token, SECRET_KEY)
    // Lookup the user in the database 
    const guest = await Guest.findOne({ _id: payload.id }).select('-__v -password')
    const status = 200
    res.json({ status, guest })  
    
  } catch (e) {
    console.error(e)
    const error = new Error('You are not authorized to access this route.')
    error.status = 401
    next(error)
  }
})


// POST
// http://localhost:5000/api/signup

router.post("/signup", async (req, res, next) => {
  const status = 201;
  try {
    const username = req.body.username;
    const password = req.body.password;
    //check username
    let guest = await Guest.findOne({ username });
    if (guest) throw new Error(`User ${username} already exists.`);

    //password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userInformation = await Guest.create({
      username,
      password: hashedPassword
    });

    guest = await Guest.findOne({ username });

    //JWOT
    //create the payload to be the user id
    const payload = { id: guest._id };
    //set options to expire in 1 day
    const options = { expiresIn: "1 day" };
    //create token
    const token = jsonwebtoken.sign(payload, SECRET_KEY, options);

    const response = token;

    res.json({ status, response });
  } catch (e) {
    console.error(e);
    const error = new Error("You can't come to this party");
    error.status = 400;
    next(error);
  }
});

//POST
// http://localhost:5000/api/login

router.post("/login", async (req, res, next) => {
  const status = 201;
  try {
    const username = req.body.username;
    const password = req.body.password;
    //looks for user
    const guest = await Guest.findOne({ username });
    //no user throw error
    if (!guest) throw new Error(`Username could not be found`);
    //check password
    const isValid = await bcrypt.compare(password, guest.password);
    //bad password throw error
    if (!isValid) throw new Error(`Password is invalid`);
    

    //JWOT
    //create the payload to be the user id
    const payload = { id: guest._id };
    //set options to expire in 1 day
    const options = { expiresIn: "1 day" };
    //create token
    const token = jsonwebtoken.sign(payload, SECRET_KEY, options);

    //happy path
    const response = "You're logged in";
    res.json({ status, response, token });
  } catch (e) {
    console.error(e);
    const error = new Error("Your login credentials don't seem to be working");
    error.status = 401;
    next(error);
  }
});


module.exports = router;

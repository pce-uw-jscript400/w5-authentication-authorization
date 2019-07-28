const router = require("express").Router();
const Guest = require("../models/guest");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

const { SECRET_KEY } = process.env;

router.get("/profile", async (req, res, next) => {
  try {
    //Create a JWT
    const token = req.headers.authorization.split("Bearer ")[1];
    const payload = jsonwebtoken.verify(token, SECRET_KEY);
    const guest = await Guest.findOne({ _id: payload.id }).select(
      "-__v -password"
    );
    const status = 200;
    res.json({ status, guest });
  } catch (e) {
    console.error(e);
    const error = new Error("You are not authorized to access this route");
    error.status = 401;
    next(error);
  }
});

router.post("/signup", async (req, res, next) => {
  const status = 201;
  try {
    const { username, password } = req.body;
    //Check for existing user
    const guest = await Guest.findOne({ username });
    if (guest) throw new Error(`User ${username} already exists`);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    guest = await Guest.create({ username, password: hashedPassword });
    const payload = { id: guest._id }; //Setup payload
    const options = { expiresIn: "1 day" }; //Sets expiration
    const token = jsonwebtoken.sign(payload, "MYSECRETPASSCODE", options);
    res.status(status).json({ status, token });
  } catch (error) {
    console.error(error);
    const e = new Error("You cant come to this party");
    e.status = 400;
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  const status = 201;
  try {
    const { username, password } = req.body;
    //Find the user by username
    const guest = await Guest.findOne({ username });
    //If it doesnt exist throw an error
    if (!guest) throw new Error(`User ${username} not found`);
    //if exists, compare the plain text password to the hashed version
    const isValid = await bcrypt.compare(password, guest.password);
    //if validation fails throw an error
    if (!isValid) throw new Error("Password is invalid");

    //Create a JWT
    const payload = { id: guest._id }; //Setup payload
    const options = { expiresIn: "1 day" }; //Sets expiration
    const token = jsonwebtoken.sign(payload, "MYSECRETPASSCODE", options);
    //If all is well, respond with a success message
    res.status(status).json({ status, token });
  } catch (error) {
    console.error(error);
    error = new Error(`Login credentials incorrect`);
    error.status = 400;
    next(error);
  }
});

module.exports = router;

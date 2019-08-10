const router = require("express").Router();
const Party = require("../models/party");
const Guest = require("../models/guest");
const jsonwebtoken = require("jsonwebtoken");
const { SECRET_KEY } = process.env;

// GET
// http://localhost:5000/api/parties/
router.get("/", async (req, res, next) => {
  const status = 200;
  let response = await Party.find({ exclusive: false }).select("-__v");

  try {
    const token = req.headers.authorization.split("Bearer ")[1];
    const payload = jsonwebtoken.verify(token, SECRET_KEY);
    const guest = await Guest.findOne({ _id: payload.id }).select(
      "-__v -password"
    );

    if (guest) {
      response = await Party.find().select("-__v");
    }
  } catch (error) {
    res.json({ status, response });
    next();
  }

  res.json({ status, response });
});
//GET
// http://localhost:5000/api/parties/exclusive
// Send jwot in auth header
router.get("/exclusive", async (req, res, next) => {
  let status = 401;
  let response = "Stop trying to make fetch happen.";
  try {
    const token = req.headers.authorization.split("Bearer ")[1];
    const payload = jsonwebtoken.verify(token, SECRET_KEY);
    const guest = await Guest.findOne({ _id: payload.id }).select(
      "-__v -password"
    );
    if (guest) {
      status = 200;
      response = await Party.findOne({ exclusive: true }).select("-__v");
    }
  } catch (error) {
    res.json({ status, response });
    next();
  }

  res.json({ status, response });
});

//GET
// not exclusive
// http://localhost:5000/api/parties/5d37b9a6d818f4ecd7259bec
// exclusive
// http://localhost:5000/api/parties/5d37b9a6d818f4ecd7259bed

router.get("/:id", async (req, res, next) => {
  let status = 200;
  let response = "";
  const party = await Party.findOne({ _id: req.params.id }).select("-__v");
  if (party.exclusive === false) {
    response = party;
  } else {
    try {
      const token = req.headers.authorization.split("Bearer ")[1];
      const payload = jsonwebtoken.verify(token, SECRET_KEY);
      const guest = await Guest.findOne({ _id: payload.id }).select(
        "-__v -password"
      );

      if (guest) {
        response = party;
      }
    } catch (error) {
      status = 401
      response = "Umm no thanks"
      res.json({ status, response });
      next();
    }
  }

  res.json({ status, response });
});

module.exports = router;

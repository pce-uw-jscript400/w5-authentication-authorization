# Authentication

By the end of this lesson, you should be able to authorize your routes with JWTs and securely store passwords.

## Core Learning Objective

*	Implement a basic authentication setup using JSON web tokens

## Sub-Objectives

* Describe the authentication process
* Store passwords with bcrypt
* Create signin and login routes that return JWTs
* Describe the difference between authentication and authorizations
* Authorize certain routes and information

## Installation

1. Fork & clone

1. `cp nodemon.sample.json nodemon.json`

1. Create a new Cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) titled something like `general-purpose` or reuse one you already have.

1. Update the `MONGO_DB_CONNECTION` in your `nodemon.json` file with the full connection string. Make sure you include the password you set up for the database and change the name of the database from `test` to something lke `exclusive_party_dev`.

1. `npm install`

1. `npm run reset-db`

1. `npm run dev`

Once installation is working, take a look at the existing code to make sure you understand what is happening. Then, try making requests to the API.

### Instructions & Guiding Questions

- [ ] Take a look at the `db/seeds.js` file.

* **Question:** Describe what this code is doing and what its purpose is.

* **Your Answer:** `deleteMany()` is called on the Party collection. This will delete all of the documents that are part of the Party collection. Once deleted, two new documents of Party are created.

---

- [ ] Imagine that as a user, you enter your username and password into a site in order to signup.

* **Question:** What happens next?

* **Your Answer:** It'll first check whether the username is exists. Then it'll validate whether the password meets requirements. Then encrypts password then saves that information in the database.

---

- [ ] Imagine that as a user, you are now logging back into that same website.

* **Question:** How does the website verify that you are indeed the same user?

* **Your Answer:** It'll read the username and then compare the password.

---

- [ ] Imagine that as a logged-in user, you try to go to a route you are not supposed to (e.g. /admin).

* **Question:** How does the website know you are or are not allowed on a specific route?

* **Your Answer:** The website knows the permissions that this user has.

* **Question:** Describe the difference between authentication and authorization.

* **Your Answer:** Authentication is you are who you say you are. Authorization is you're allowed to do what you want to do.

---

- [ ] Build a new model called `Guest`. The `Guest` model should have the following fields: `username`, `password`

---

- [ ] Create a new route at `POST /api/signup` at `/api/routes/auth.js`. This route should:
  1. Create a new `Guest`, pulling `username` and `password` from the request body
  1. Return a success message with the user's information (for now)

* **Question:** This code is currently _very_ insecure. Why?

* **Your Answer:** The code is insecure because we are returning the users username and password with each successful request.

* **Question:** What would happen if three different users tried to sign up with the same username? How can we prevent that?

* **Your Answer:** With our current code that is possible. We could iterate through all users and if username exists and if so throw an error.

* **Question:** Why are we making our route `POST /api/signup` as opposed to `POST /api/users`?

* **Your Answer:** Signup is more descriptive and terminology commonly used for auth. API users infers more of an admin creating users.

---

- [ ] We need a way to securely store a password in our database. Install [node.bcrypt.js](https://www.npmjs.com/package/bcrypt), require it in your new routes file, and use the `bcrypt.hash()` method to encrypt the password before storing it. Test your signup process to make sure the password is hashed.

  _NOTE 1:_ It is not uncommon for issues to arise while trying to install bcrypt. If you encounter issues during the lesson trying to get it to install, check the [Install via NPM](https://www.npmjs.com/package/bcrypt#install-via-npm) section of the documentation to see if you can find any help. If not, take notes until we move pass bcrypt and we can get it resolved during a break or after class.

  _NOTE 2:_ Use the promisified `bcrypt.hash()` method instead of the callback version.

* **Question:** Describe what is meant by the term `saltRounds`. If you need help, the [documentation](https://www.npmjs.com/package/bcrypt#a-note-on-rounds) has some explanation. This [StackOverflow answer](https://stackoverflow.com/a/46713082) also might help.

  _NOTE: We will not go into this too deeply for the sake of brevity, however this is a really interesting topic! I would encourage you to look into this more on your own, if you're interested._

* **Your Answer:** Salt rounds will set a number or rounds that will be used to hash the password.

---

- [ ] Right now, users can create new accounts with the same username. Update your code so that before we create a guest, we check to see whether or not a guest already exists with that username. If it does, return an error.

  _NOTE: While it is possible to use the `unique: true` constraint on our model, it requires a bit of extra configuration to get working properly. See the [Advanced](#advanced) section below for more information on how to do this!_

---

- [ ] Now that we can signup a user, we want them to be able to login to our site. Build a `POST /login` route that expects a username and password in the request body. Use the `bcrypt.compare()` function to compare the incoming plain text password with the hashed password stored in MongoDB. If the username or password is incorrect, return a non-specific error message (e.g. "Login credientials incorrect.") with a status code of 401. If the username and password combination is correct, return a temporary success message (e.g. "You are now logged in") and a status code of 201.

* **Question:** Why is it important to give a non-specific error message as opposed to a message like "Password incorrect?"

* **Your Answer:** It's important because we want to keep that error message internal.

---

- [ ] The above process can be a bit tricky. Take a moment to annotate your code with comments, explaining each step of your code.

---

- [ ] On subsequent requests to our API, how will we know a user is logged in? We need to provide them with something so that we later know they have indeed successfully logged in. There are a few different strategies for this, but we will be using [JWTs](https://jwt.io/introduction/) (pronounced "jots"). Take a moment to read the section titled "What is the JSON Web Token structure?"

* **Question:** In your own words, describe the three parts of a JWT.

* **Your Answer:**
Header => Similar to metadata, info on the request, includes type and signing
Payload => Contains statements about user and additional data
Signature => Verifies that secret is included, meaning that it is valid

---

- [ ] We will implement JWTs using the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) package. Install this package and include it at the top of your `auth.js` file.

* **Question:** Which of our current routes will require us to use the `jsonwebtoken` library? (i.e. When will we be creating or decoding JWTs?)

* **Your Answer:** We will be creating JWTs after a user successfully logs in.

* **Question:** JWTs allow for custom information (i.e. payload) to be returned back to the client. What kind of information do you think would be useful to send back to our client?

* **Your answer:** Information that we want to return to the client include the user's information like an ID, username or name, permissions or settings.

* **Question:** The custom information (i.e. payload) inside of JWT can be [easily decoded](https://jwt.io/#debugger). What kind of information should we _not_ store inside of a JWT?

* **Your Answer:** We should not store the password, private information like credit card information.

---

- [ ] Add the following code to `/login` route and then respond with the token when a user successfully is able to login. _NOTE: In the example below, I assume you've required the package and assigned it to a `jsonwebtoken` variable._

  ```js
  const payload = { id: guest._id }
  const options = { expiresIn: '1 day' }
  const token = jsonwebtoken.sign(payload, 'MYSECRETPASSCODE', options)
  ```

* **Question:** The `.sign()` method takes three arguments. Describe each argument in your own words, using the above code as an example.

* **Your Answer:** The `sign()` method takes in the payload which gives the JWT information like the ID of the guest. It also takes the environment variable `SECRET_KEY` which is defined in our `nodemon.json` file. The last argument is an object containing options for this JWT. In our example we passed an option to have the JWT expire in one day.

---

- [ ] Right now our secret is not so secret. Add a new environment variable to your `nodemon.json` file that stores the secret code. Then, use it in your `auth.js` file. _NOTE: Make sure to restart your server!_

---

- [ ] Modify the `/signup` route to return a token in place of the user information.

---

- [ ] We are now responding with JWTs when a user is properly **authenticated**. We will use those JWTs to **authorize** whether or not someone is allowed to visit certain routes or gain certain information.

* **Question:** Describe the difference between **authentication** and **authorization**, given the above context.

* **Your Answer:** Authentication means that you are who you say you are and Authorization means that you have permissions to access something. With JWTs when a user is properly authenticated then a JWT is created. The JWT token of the signed in user is then checked to verify whether the guest has authorization to access the route.

---

- [ ] Add the following route to the top of your `auth.js` file. Then, make a request to this route in Postman.

  ```js
  router.get('/profile', async (req, res, next) => {
    try {
      const token = req.headers.authorization.split('Bearer ')[1]
      const payload = jsonwebtoken.verify(token, SECRET_KEY)
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
  ```

* **Question:** What happens? Why?

* **Your Answer:** We get an error message that we are not authorized. That is because we made the request without the token.

---

- [ ] In order to successfully access this route, we will need to send over the token in the HTTP Authorization Header. The typical way to do this is by sending a [Bearer token](https://security.stackexchange.com/questions/108662/why-is-bearer-required-before-the-token-in-authorization-header-in-a-http-re). To do this in Postman, go to the "Authorization" tab, select "Bearer Token" as the Type, and then enter your token.

* **Question:** What happens? Why?

* **Your Answer:** By doing this we are able to get authorization because the token is validated.

---

- [ ] There is a lot going on in the above code. Take a moment to annotate each line so you are able to confirm your understanding of what is happening.

### Mini-Exercise

Our final step is to **authorize** users to view certain routes or information. With a partner, complete the following:

1. Using route-level middleware, protect the `GET /api/parties/exclusive` route. If a user provides a token, they are able to see all of the exclusive parties. If not, return a 401 Unauthorized message.

1. In the `GET /api/parties` route, return all parties if a user is authorized. Otherwise, return only those parties where `exclusive: false`.

1. In the `GET /api/parties/:id` route, return the party if the user is authorized. If the user is not authorized, only return the party if it is _not_ exclusive. Otherwise, return a 401 Unauthorized message.

### Advanced

#### Building a New Index

If you want to build a new [index](https://docs.mongodb.com/manual/indexes/), you will have to connect directly to MongoDB using your command line due to the fact that we are using a free tier from MongoDB Atlas. It's not too hard!

1. From the "Overview" tab on your MongoDB cluster, click the "Connect" button.

1. Click "Connect from Mongo Shell"

1. Follow the instructions for installing MongoDB locally on your system

1. Copy the command in the final step of the instructions and paste that into your command line

1. Enter your password as defined in your `nodemon.json` file

1. Once connected, try running the `show dbs` command

1. Connect to your database using the `use <database-name>` command

1. Run the following:
  ```
  db.guests.createIndex({ "username": 1}, { unique: true })
  ```

1. Type `exit` to leave the shell
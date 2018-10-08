const express = require('express')
const router = express.Router()

// Load gravatar
const gravatar = require('gravatar')

// Load Bcrypt
const bcrypt = require('bcryptjs')

// Load User model
const User = require('../../models/User')

// @route  GET api/users/test
// @desc   Tests user route
// @access Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works!' }))

// @route  GET api/users/register
// @desc   Register a user
// @access Public
router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: 'Email already exists!' })
    } else {
      const avatar = gravatar.url(req.body.email, {
        size: 200, // Size
        r: 'pg', // Rating
        d: 'mm' // Default
      })

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      })

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err
          newUser.password = hash
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err))
        })
      })
    }
  })
})

// @route  GET api/users/login
// @desc   Login user / Returning a JWT token
// @access Public
router.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  // Find the user
  User.findOne({ email }).then(user => {
    // Check for user
    if (!user) {
      return res.status(404).json({ email: 'User not found!' })
    }

    // Check passowrd
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        res.json({ msg: 'Success' })
      } else {
        res.status(400).json({ password: 'Password incorrect!' })
      }
    })
  })
})

module.exports = router

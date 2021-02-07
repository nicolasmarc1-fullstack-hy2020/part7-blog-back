const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.route('')
  .get(async (req, res) => {
    const users = await User.find({})
      .populate('blogs', { url: 1, title: 1, author: 1, id: 1 })
    res.json(users.map(u => u.toJSON()))
  })
  .post(async (req, res) => {
    const body = req.body
    // can't test password length with mongoose validation beacause passwordhash length is different
    if (!(body.password && body.password.length > 2)) {
      return res.status(400).json({ error: 'password must be at least 3 characters long' })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const newUser = new User({
      name: body.name,
      username: body.username,
      passwordHash
    })

    const createdUser = await newUser.save()
    res.json(createdUser)
  })

module.exports = usersRouter
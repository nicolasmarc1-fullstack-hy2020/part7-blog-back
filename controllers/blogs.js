const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')





blogsRouter.route('')
  .get(async (req, res) => {
    const blogs = await Blog.find({})
      .populate('user', { username: 1, name: 1, id: 1 })
    res.json(blogs.map(blog => blog.toJSON()))
  })
  .post(async (req, res) => {
    if (!req.token) {
      return res.status(401).json({ error: 'missing token' })
    }

    const body = req.body
    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    // jwt already throw error if not verified and error handling
    // middleware will throw invalid token, just additional security
    // if valid token but server didn't put the id in it
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'invalid token' })
    }
    const user = await User.findById(decodedToken.id)
    if (user === null) {
      return res.status(401).json({ error: `user doesn't exist` })
    }
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id,
      comments: []
    })
    //  new: true }
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    const populatedCreatedBlog = await savedBlog.populate('user', { username: 1, name: 1, id: 1 })
    await populatedCreatedBlog.execPopulate()
    res.json(populatedCreatedBlog.toJSON())

  })

blogsRouter.route('/:id')
  .get(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
    console.log(blog)
    if (blog) {
      res.json(blog.toJSON())
    } else {
      res.status(404).end()
    }
  })
  .delete(async (req, res) => {
    if (!req.token) {
      return res.status(401).json({ error: 'missing token' })
    }

    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'invalid token' })
    }

    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(204).end()
    }
    if (blog && blog.user.toString() === decodedToken.id.toString()) {
      await User.findByIdAndUpdate(decodedToken.id, { $pull: { blogs: req.params.id } })
      // can use multi for many to many https://stackoverflow.com/questions/36167286/how-to-properly-delete-an-orphaned-reference-in-mongodb
      await blog.remove()
      res.status(204).end()
    } else {
      res.status(401).json({ error: 'not authorized' })
    }

  })
  .put(async (req, res) => {
    const body = req.body
    const blog = ({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      comments: body.comments
    })
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true }).populate('user', { username: 1, name: 1, id: 1 })
    if (updatedBlog) {
      res.json(updatedBlog.toJSON())
    } else {
      res.status(404).end()
    }


  })


  blogsRouter.route('/:id/comments')
  // .get(async (req, res) => {
  //   const blogs = await Blog.find({})
  //     .populate('user', { username: 1, name: 1, id: 1 })
  //   res.json(blogs.map(blog => blog.toJSON()))
  // })
  .post(async (req, res) => {
    // id in rul, comment in body
    console.log("hello");
    if (!req.token) {
      return res.status(401).json({ error: 'missing token' })
    }

    const body = req.body
    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    // jwt already throw error if not verified and error handling
    // middleware will throw invalid token, just additional security
    // if valid token but server didn't put the id in it
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'invalid token' })
    }
    const oldBlog = await Blog.findById(req.params.id)

    // const newBlog = ({
    //   ...oldBlog,
    //   comments: [...oldBlog.comments, body.newComment]
    // })
    oldBlog.comments.push(body.newComment)
    console.log(oldBlog);
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, oldBlog, { new: true }).populate('user', { username: 1, name: 1, id: 1 })
    console.log(updatedBlog);
    if (updatedBlog) {
      res.json(updatedBlog.toJSON())
    } else {
      res.status(404).end()
    }

  })



module.exports = blogsRouter


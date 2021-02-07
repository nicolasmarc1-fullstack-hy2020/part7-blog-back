const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const bcrypt = require('bcrypt')



let currentToken
let currentUser
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(helper.validUsers[0].password, saltRounds)
  const user = new User({ ...helper.validUsers[0], passwordHash })
  currentUser = await user.save()
  const result =
    await api
      .post('/api/login')
      .send({ username: helper.validUsers[0].username, password: helper.validUsers[0].password })
      .expect(200)

  currentToken = `bearer ${result.body.token}`
  console.log(currentToken)

  for (const blog of helper.initalBlogs) {
    blog.user = currentUser._id
  }
  const blogObjects = helper.initalBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.
    map(blog => blog.save())
  const savedBlogs = await Promise.all(promiseArray)
  savedBlogs.map(savedBlog => {
    currentUser.blogs = currentUser.blogs.concat(savedBlog._id)
  })
  await currentUser.save()
})


describe('when there is a user and blogs initially saved', () => {

  describe('get blogs list', () => {

    test('returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    test('with all blogs returned', async () => {
      const response = await api.get('/api/blogs')
      expect(response.body.length).toBe(helper.initalBlogs.length)
    })
    test('containing a specific blog', async () => {
      const response = await api.get('/api/blogs')
      const titles = response.body.map(r => r.title)
      expect(titles).toContain(
        helper.initalBlogs[0].title
      )
    })
    test('with id not _id', async () => {
      const response = await api.get('/api/blogs')
      const blogs = response.body
      expect(blogs[0]._id).not.toBeDefined()
      expect(blogs[0].id).toBeDefined()
    })
  })


  describe('viewing a specific blog', () => {
    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToView = blogsAtStart[0]
      const result = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(result.body).toMatchObject({ ...blogToView, user: blogToView.user.id })
    })
    // pb why ok?
    test('fails with statuscode 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()
      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'
      await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400)
    })
  })


  describe('deletion of a blog', () => {
    describe('when the user is logged', () => {

      test('succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .set('authorization', currentToken)
          .expect(204)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(
          helper.initalBlogs.length - 1
        )
        const titles = blogsAtEnd.map(blog => blog.title)
        expect(titles).not.toContain(blogToDelete.content)
      })
    })
    describe('when the user has no token', () => {

      test('fails with valid data, unauthorized code and missing token message', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        const result =
          await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(401)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(helper.initalBlogs.length)
        expect(result.body.error).toBe('missing token')
      })
    })
    describe('when the user has an invalid token', () => {

      test('fails with valid data, unauthorized code and invalid token message', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]
        const result =
          await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('authorization', "bearer random123jkjljkljkljrandom")
            .expect(401)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(helper.initalBlogs.length)
        expect(result.body.error).toBe('invalid token')
      })
    })
  })


  describe('update a blog', () => {
    test('likes count by increment', async () => {
      const likesIncrement = 1
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = { ...blogsAtStart[0], likes: blogsAtStart[0].likes + likesIncrement }

      const response =
        await api
          .put(`/api/blogs/${blogToUpdate.id}`)
          .send(updatedBlog)
          .expect(200)
      expect(response.body.likes).toBe(updatedBlog.likes)
    })
  })


  describe('new blog creation', () => {
    describe('when the user is logged', () => {

      test('succeeds with valid data', async () => {

        const newValidBlog = {
          title: "TEST---Algebraic Effects for the Rest of Us",
          author: "Dan Abramov",
          url: "https://overreacted.io/algebraic-effects-for-the-rest-of-us/",
          likes: 6
        }

        console.log("t", currentToken)
        const result =
          await api
            .post('/api/blogs')
            .set('authorization', currentToken)
            .send(newValidBlog)
            .expect(200)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(helper.initalBlogs.length + 1)
        const titles = blogsAtEnd.map(r => r.title)
        expect(titles).toContain(newValidBlog.title)
        expect(result.body.user.id.toString()).toBe(currentUser.id.toString())
      })

      test('without likes property, it defaults to 0', async () => {
        const newBlogWithoutLikes = {
          title: "FIRST WEEK OF LAUNCHING VUE.JS",
          author: "Evan You",
          url: "https://blog.evanyou.me/2014/02/11/first-week-of-launching-an-oss-project/",
        }
        const sameBlog = await api
          .post('/api/blogs')
          .set('authorization', currentToken)
          .send(newBlogWithoutLikes)
          .expect(200)
        // const blogsAtEnd = await helper.blogsInDb()
        // const sameBlog = blogsAtEnd.find(blog => blog.title === newBlogWithoutLikes.title)
        expect(sameBlog.body.likes).toBe(0)
      })

      test('fails with status code 400 if no url', async () => {
        const newBlogWithoutURL = {
          title: "Algebraic Effects for the Rest of Us",
          author: "Dan Abramov",
          url: "",
          likes: 6
        }
        await api
          .post('/api/blogs')
          .set('authorization', currentToken)
          .send(newBlogWithoutURL)
          .expect(400)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(helper.initalBlogs.length)
      })

      test('fails with status code 400 if no title', async () => {
        const newBlogWithoutTitle = {
          title: "",
          author: "Dan Abramov",
          url: "https://overreacted.io/algebraic-effects-for-the-rest-of-us/",
          likes: 6
        }
        await api
          .post('/api/blogs')
          .set('authorization', currentToken)
          .send(newBlogWithoutTitle)
          .expect(400)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(helper.initalBlogs.length)
      })
    })
    describe('when the user has no token', () => {

      test('fails with valid data, unauthorized code and missing token message', async () => {

        const newValidBlog = {
          title: "TEST---Algebraic Effects for the Rest of Us",
          author: "Dan Abramov",
          url: "https://overreacted.io/algebraic-effects-for-the-rest-of-us/",
          likes: 6
        }

        const result =
          await api
            .post('/api/blogs')
            .send(newValidBlog)
            .expect(401)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(helper.initalBlogs.length)
        expect(result.body.error).toBe('missing token')
      })
    })
    describe('when the user has an invalid token', () => {

      test('fails with valid data, unauthorized code and invalid token message', async () => {

        const newValidBlog = {
          title: "TEST---Algebraic Effects for the Rest of Us",
          author: "Dan Abramov",
          url: "https://overreacted.io/algebraic-effects-for-the-rest-of-us/",
          likes: 6
        }

        const result =
          await api
            .post('/api/blogs')
            .set('authorization', "bearer random123jkjljkljkljrandom")
            .send(newValidBlog)
            .expect(401)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(helper.initalBlogs.length)
        expect(result.body.error).toBe('invalid token')
      })
    })
  })


  describe('user creation', () => {

    test('succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = helper.validUsers[1]

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: helper.validUsers[0].username,
        name: 'blabla',
        password: 'bloblo',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('`username` to be unique')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length)

    })

    test('creation of user fails with proper statuscode and message if password less than 3', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'abc',
        name: 'abcd',
        password: 'ab',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
      console.log(result.body)

      expect(result.body.error).toBe('password must be at least 3 characters long')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length)

    })

    test('creation fails with proper statuscode and message if username less than 3', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'ac',
        name: 'abcd',
        password: 'abc',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('is shorter than the minimum allowed length (3)')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length)

    })
  })


})


afterAll(() => {
  mongoose.connection.close()
})

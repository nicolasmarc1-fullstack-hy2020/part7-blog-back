const Blog = require('../models/blog')
const User = require('../models/user')

const validUsers = [
  {
    username: "hellas",
    name: "Arto Hellas",
    password: "sekret"
  },
  {
    username: "mluukkai",
    name: "Matti Luukkainen",
    password: "salainen"
  }
]

const initalBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12
  },
  // {
  //   title: "First class tests",
  //   author: "Robert C. Martin",
  //   url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html",
  //   likes: 10
  // },
  // {
  //   title: "TDD harms architecture",
  //   author: "Robert C. Martin",
  //   url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
  //   likes: 0
  // },
  // {
  //   title: "Type wars",
  //   author: "Robert C. Martin",
  //   url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
  //   likes: 2
  // }
]


const bigListOfBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html",
    likes: 10
  },
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2
  }
]


const nonExistingId = async () => {
  const blog = new Blog(
    {
      title: "aaadssds",
      author: "aaaan",
      url: "http://dss.html",
      likes: 20
    }
  )
  await blog.save()
  await blog.remove()
  return blog._id.toString()
}


const blogsInDb = async () => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 })
  return users.map(user => user.toJSON())
}


module.exports = { initalBlogs, blogsInDb, nonExistingId, usersInDb, validUsers, bigListOfBlogs }


// const initalBlogs = [
//   {
//     _id: "5a422a851b54a676234d17f7",
//     title: "React patterns",
//     author: "Michael Chan",
//     url: "https://reactpatterns.com/",
//     likes: 7,
//     __v: 0
//   },
//   { _id: "5a422aa71b54a676234d17f8", title: "Go To Statement Considered Harmful", author: "Edsger W. Dijkstra", url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", likes: 5, __v: 0 }, { _id: "5a422b3a1b54a676234d17f9", title: "Canonical string reduction", author: "Edsger W. Dijkstra", url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", likes: 12, __v: 0 }, { _id: "5a422b891b54a676234d17fa", title: "First class tests", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll", likes: 10, __v: 0 }, { _id: "5a422ba71b54a676234d17fb", title: "TDD harms architecture", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html", likes: 0, __v: 0 }, { _id: "5a422bc61b54a676234d17fc", title: "Type wars", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", likes: 2, __v: 0 }
// ]



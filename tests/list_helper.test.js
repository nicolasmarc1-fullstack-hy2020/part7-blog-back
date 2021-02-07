const listHelper = require('../utils/list_helper')
const { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes } = listHelper
const helper = require('./test_helper')


test('dummy returns 1', () => {
  const blogs = []
  const result = dummy(blogs)
  expect(result).toBe(1)
})



describe('total likes', () => {

  test('of empty list is zero', () => {
    expect(totalLikes([])).toBe(0)
  })

  test('of list with only one blog is the likes of that blog', () => {
    expect(totalLikes([helper.bigListOfBlogs[0]])).toBe(7)
  })

  test('of a bigger list is the sum of their likes', () => {
    expect(totalLikes(helper.bigListOfBlogs)).toBe(36)
  })
})


describe('favorite Blog', () => {

  test('is the one with most likes', () => {
    expect(favoriteBlog(helper.bigListOfBlogs)).toEqual(
      {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        likes: 12
      }
    )
  })
})


describe('Author with most blogs', () => {
  test('is the one that appear the most in blogs author property', () => {
    expect(mostBlogs(helper.bigListOfBlogs)).toEqual(
      {
        author: "Robert C. Martin",
        blogs: 3
      }
    )
  })
})


describe('Author with most likes', () => {
  test('is the one where the sum of all blogs likes is max', () => {
    expect(mostLikes(helper.bigListOfBlogs)).toEqual(
      {
        author: "Edsger W. Dijkstra",
        likes: 17
      }
    )
  })
})


// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {

  return 1
}

const totalLikes = (blogs) =>
  blogs.reduce((total, blog) => total += blog.likes, 0)



// compact version with IFEE, arrow functions, destructuring assignment and property shorthands
// const favoriteBlog = blogs =>
//   blogs.reduce((max, blog) =>  max === null || blog.likes > max.likes ?
//       (({ title, author, likes }) => ({ title, author, likes }))(blog) :  max)

//  intermediary more readable  version
// const favoriteBlog = (blogs) => {
//   return blogs.reduce((max, blog) => {
//     console.log(max)
//     if (blog.likes > max.likes) {
//       return (({ title, author, likes }) => ({ title, author, likes }))(blog)

//       //   const a {title, author, likes} = blog
//     } else {
//       return max
//     }
//   },
//     {
//       title: undefined,
//       author: undefined,
//       likes: 0
//     }
//   )
// }


//  even more readable version
const favoriteBlog = (blogs) => {
  return blogs.reduce((max, blog) => {
    if (max === null || blog.likes > max.likes) {
      return { title: blog.title, author: blog.author, likes: blog.likes }
    } else {
      return max
    }
  })
}

const authorStats = blogs => {
  return blogs.reduce((map, blog) => {
    if (!map.get(blog.author)) {
      map.set(blog.author, {
        likes: blog.likes,
        blogs: [blog]
      })
    } else {
      map.get(blog.author).likes += blog.likes
      map.get(blog.author).blogs.push(blog)
    }
    return map
  }, new Map())
}


const mostBlogs = (blogs) => {
  const authorStatsArr = [...authorStats(blogs)]
  const authorBlogCountArr = authorStatsArr.map(authorStat => ({ author: authorStat[0], blogs: authorStat[1].blogs.length }))
  return authorBlogCountArr.sort((a, b) => a.blogs - b.blogs).reverse()[0]
}

const mostLikes = blogs => {
  const authorStatsArr = [...authorStats(blogs)]
  const authorLikesArr = authorStatsArr.map(authorStat => ({ author: authorStat[0], likes: authorStat[1].likes }))
  return authorLikesArr.sort((a, b) => a.likes - b.likes).reverse()[0]
}



module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}


const _ = require('lodash');

const dummy = (list) => {
  return 1
}

const totalLikes = (blogList) => { 
  return blogList.reduce((total, {likes}) => total + likes, 0)
}

const favoriteBlog = (blogList) => {
  let maxLikes = 0
  let favoriteBlog = blogList[0]
  blogList.forEach(blog => {
    if (blog.likes > maxLikes){
      favoriteBlog = blog
      maxLikes = blog.likes
    }
  })
  return { title: favoriteBlog.title, author: favoriteBlog.author, likes: favoriteBlog.likes }
}

const mostBlogs = (blogList) => {
  const blogCounts = _(blogList)
                      .countBy('author')
                      .map((count, author) => ({
                        'author': author,
                        'blogs': count
                      }))
                      .value()
  return _.maxBy(blogCounts, 'blogs')
}

const mostLikes = (blogList) => {
  const likeCounts = _(blogList)
                      .groupBy('author')
                      .map((objects, key) => ({
                        'author': key,
                        'likes': _.sumBy(objects, 'likes')}))
                      .value()
  return _.maxBy(likeCounts, 'likes')
}


  
module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
  }

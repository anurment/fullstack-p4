const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(blogs)
})


blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  response.status(200).json(blog)
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body
    if (!request.token) {
      return response.status(401).json({ error: 'token missing' })
    }

    //console.log(`body.title: ${body.title}`)
    if (!request.user){
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(request.user)

    if (!(body.title) || !(body.url)) {
      response.status(400).end()
    } else {

      const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user._id
      })
  
      const savedBlog = await blog.save()
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()
      response.status(201).json(savedBlog)
    }


})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  console.log(blog)
  console.log(blog.user.toString())

  if( blog.user.toString() === request.user){
    await Blog.findByIdAndDelete(blog._id)
    response.status(204).end()
  } else {
    response.status(403).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const update = request.body
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, update, {new: true})
  //console.log(`updatedBlog.id: ${updatedBlog.id}`)
  response.status(200).json(updatedBlog)

})


module.exports = blogsRouter

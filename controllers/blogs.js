const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})


blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  response.status(200).json(blog)
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body

    if (!(body.title) || !(body.url)) {
      response.status(400).end()
    } else {

      const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0
      })
  
      const savedBlog = await blog.save()
      response.status(201).json(savedBlog)
    }


})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const update = request.body
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, update, {new: true})
  //console.log(`updatedBlog.id: ${updatedBlog.id}`)
  response.status(200).json(updatedBlog)

})


module.exports = blogsRouter

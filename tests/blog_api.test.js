const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

const Blog = require('../models/blog')


describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
    })

    test('all blogs are returned as json', async () => {
        const response = await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('the identifier property of a returned blog is .id', async () => {
        const response = await api.get('/api/blogs')
        assert('id' in response.body[0])
    })

    test('a blog can be added to the database', async () => {
        const newBlog = {
            title: "in truth, only atoms and the void",
            author: "Sean Carroll",
            url: "http://https://www.preposterousuniverse.com/blog/",
            likes: 2,
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)

        const response = await api.get('/api/blogs')

        const title = response.body.map(r => r.title)

        assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

        assert(title.includes('in truth, only atoms and the void'))       
    })

    test('when adding a blog, if likes is undefiend set it to zero', async () => {
        const newBlog = {
            title: "say my name",
            author: "Werner Heisenberg",
            url: "https://en.wikipedia.org/wiki/Werner_Heisenberg",
        }

        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    const response = await Blog.find({ title: 'say my name'});

    assert.strictEqual(response[0].likes, 0)    
    })

    test('when adding a blog, if title or url is undefined, status code 400 is returned', async () => {

        const blogNoTitle = {
            author: "Werner Heisenberg",
            url: "https://en.wikipedia.org/wiki/Werner_Heisenberg",
        }

        await api
            .post('/api/blogs')
            .send(blogNoTitle)
            .expect(400)

        const blogNoUrl = {
            title: "say my name",
            author: "Werner Heisenberg",
        }
    
        await api
            .post('/api/blogs')
            .send(blogNoUrl)
            .expect(400)
    })
    

    test('a blog can be deleted', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]
      
        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .expect(204)
      
        const blogsAtEnd = await helper.blogsInDb()
      
        const urls = blogsAtEnd.map(blog => blog.url)
        assert(!urls.includes(blogToDelete.url))
      
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
      })

      test('a blog can be updated', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToBeUpdated = blogsAtStart[0]
        const update = {likes: blogToBeUpdated.likes+1}
        
        const response = await api
                        .put(`/api/blogs/${blogToBeUpdated.id}`)
                        .send(update)
                        .expect(200)

        assert.strictEqual(response.body.likes, update.likes)
      })
      

})

after(async () => {
  await mongoose.connection.close()
})

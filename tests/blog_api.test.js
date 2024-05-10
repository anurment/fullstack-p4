const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

const Blog = require('../models/blog')
const User = require('../models/user')

describe('when there is initially some blogs saved', () => {

    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
    })

    test('all blogs are returned as json', async () => {
        const response = await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
        const length = response.body.length
        assert.strictEqual(length, helper.initialBlogs.length)
    })

    test('the identifier property of a returned blog is .id', async () => {
        const response = await api.get('/api/blogs')
        const body = response.body[0]
        assert('id' in body)
    })
  
})

describe('when user is logged in', () => {
    let loginResponse;
    let initialUser;
    beforeEach(async () => {
        await Blog.deleteMany({})
        await User.deleteMany({})

        const randomInt = helper.getRandomInt(1,10**4)

        initialUser = {
            username: `userForBlogTest${randomInt}`,
            name: 'Tomi Testaaja',
            password: 'Salainen'
        }
        await api
            .post('/api/users')
            .send(initialUser)
            .expect(201)
        const response = await api
                        .post('/api/login')
                        .send({username: initialUser.username, password: initialUser.password})
                        .expect(200)
        loginResponse = response.body

    })
    let initialBlog;
    let bearerToken;
    beforeEach(async () => {
        const randomInt = helper.getRandomInt(1,10**10)
        initialBlog = {
            title: `testTitle ${randomInt}`,
            author: "Test Author",
            url: "http://https://www.testBlog.com/blog/",
            likes: 2,
        }
        bearerToken = `Bearer ${loginResponse.token}`
        await api
                .post('/api/blogs')
                .set('Authorization', bearerToken)
                .send(initialBlog)
                .expect(201)

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
            .set('Authorization', bearerToken)
            .send(newBlog)
            .expect(201)

        const response = await api.get('/api/blogs')

        const title = response.body.map(r => r.title)

        assert.strictEqual(response.body.length, 1 + 1)

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
        .set('Authorization', bearerToken)
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
            .set('Authorization', bearerToken)
            .send(blogNoTitle)
            .expect(400)

        const blogNoUrl = {
            title: "say my name",
            author: "Werner Heisenberg",
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', bearerToken)
            .send(blogNoUrl)
            .expect(400)
    })
    
    test('a blog can be deleted', async () => {
        const query = Blog.where({title: initialBlog.title})
        const blogToDelete = await query.findOne()
        
        const blogsAtStart = await Blog.find({})
 
        await api
          .delete(`/api/blogs/${blogToDelete.id.toString()}`)
          .set('Authorization', bearerToken)
          .expect(204)
      
        const blogsAtEnd = await Blog.find({})
      
        const urls = blogsAtEnd.map(blog => blog.url)
        assert(!urls.includes(blogToDelete.url))
      
        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
      })

      test('a blog can be updated', async () => {
        const query = Blog.where({title: initialBlog.title})
        const blogToBeUpdated = await query.findOne()
        const update = {likes: blogToBeUpdated.likes+1}
        
        const response = await api
                        .put(`/api/blogs/${blogToBeUpdated.id.toString()}`)
                        .send(update)
                        .expect(200)

        assert.strictEqual(response.body.likes, update.likes)
      })
})

after(async () => {
  await mongoose.connection.close()
})

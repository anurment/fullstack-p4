const bcrypt = require('bcryptjs')
const User = require('../models/user')
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

//...

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails if name and credentials are not valid', async () => {

    usernames = [undefined,'ml']
    names = [undefined, 'Matti Luukkainen']
    passwords = [undefined, 'sa']

    for (let i = 0; i < usernames.length; i++){
      for (let j = 0; j < names.length; j++){
        for(let k = 0; k < passwords.length; k++){

          let newUser = {
            username: usernames[i],
            name: names[j],
            password: passwords[k]
          }
          let response = await api
                          .post('/api/users')
                          .send(newUser)
                          .expect(403)
          if(i === 0 || j === 0 || k === 0){
            let errormsg = response.body.error
            assert(errormsg.includes('missing'))
          }
          if(i === 1 && j === 1 && k === 1 ){
            let errormsg = response.body.error
            assert(errormsg.includes('Minimum length'))
          }
        }
      }
    }
    

  

    
    





  })

})

after(async () => {
    await mongoose.connection.close()
  })

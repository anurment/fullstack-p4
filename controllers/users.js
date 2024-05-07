const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

const ValidateUserNameAndPw = (username,name, password) => {
  if (name === undefined){
    return {error: 'name missing'}
  } else if(username === undefined){
    return {error: 'username missing'}
  } else if (password === undefined) {
      return {error: 'password missing'}
  } else if (username.length < 3) {
    return {error: 'Minimum length for username is 3 characters'}
  } else if (password.length < 3) {
    return {error: 'Minimum length for password is 3 characters'}
  } else {
    return false
  }
}

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const errorMsg = ValidateUserNameAndPw(username, name, password)

  if ((errorMsg)) {
    response.status(403).json(errorMsg)
  

  } else {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
  }

})

usersRouter.get('/', async (request, response) => {
    const allUsers = await User.find({})
    response.json(allUsers)
})

module.exports = usersRouter

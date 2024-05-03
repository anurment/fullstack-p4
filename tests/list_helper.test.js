const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const helper = require('./test_helper.js')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(helper.initialBlogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {

    test('when blogList has only one blog equals the likes of that', () => {
      const result = listHelper.totalLikes(helper.initialBlogs.slice(0,1))
      assert.strictEqual(result, 7)
    })

    test('for all the blogs equal to 36', () => {
        const result = listHelper.totalLikes(helper.initialBlogs)
        assert.strictEqual(result, 36)
    })
})

describe('favorite blog', () => {
    test('is the one with the highest number of likes', () => {
        const result = listHelper.favoriteBlog(helper.initialBlogs)
        assert.deepStrictEqual(result, { title: "Canonical string reduction", author: "Edsger W. Dijkstra", likes: 12 }
        )
    })
})

describe('most blogs', () => {
    test('is the one with the highest number of blogs', () => {
        const result = listHelper.mostBlogs(helper.initialBlogs)
        assert.deepStrictEqual(result, {author: "Robert C. Martin", blogs: 3})
    })
})

describe('writer with the most likes', () => {
    test('is the one with the highest number of total likes', () => {
        const result = listHelper.mostLikes(helper.initialBlogs)
        assert.deepStrictEqual(result, {author: "Edsger W. Dijkstra", likes: 17 })
    })
})



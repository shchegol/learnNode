const fs = require('fs')
const request = require('request')
const assert = require('assert')
const config = require('config')
const server = require('../server')

describe('server tests', () => {
  before((done) => {
    server.listen(3000, done)
  })

  after((done) => {
    server.close(done)
  })

  it('GET index.html', (done) => {
    const content = fs.readFileSync('public/index.html');

    request('http://localhost:3000', function(error, response, body) {
      if (error) return done(error)

      assert.equal(response.headers['content-type'], 'text/html')
      assert.equal(response.statusCode, 200)
      assert.equal(content, body)

      done()
    })
  })

  it('GET exist file', (done) => {
    const content = fs.readFileSync('files/1.txt');

    request('http://localhost:3000/1.txt', function(error, response, body) {
      if (error) return done(error)

      assert.equal(content, body)

      done()
    })
  })

  it('GET file not found', (done) => {
    request('http://localhost:3000/notfound.txt', function(error, response) {
      if (error) return done(error)

      assert.equal(response.statusCode, 404)

      done()
    })
  })
})

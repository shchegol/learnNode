const fs = require('fs')
const request = require('request')
const assert = require('assert')
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
})

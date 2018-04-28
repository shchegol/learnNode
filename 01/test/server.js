const fs = require('fs')
// const path = require('path')
const request = require('request')
const assert = require('assert')
// const config = require('config')
const server = require('../server')
// const should = require('should')

// const host = 'http://127.0.0.1:3000';
// const fixturesRoot = __dirname + '/fixtures';

describe('server tests', () => {
  before((done) => {
    server.listen(3000, done)
  })

  after((done) => {
    server.close(done)
  })

  it('/GET index.html', (done) => {
    const content = fs.readFileSync('public/index.html')

    request('http://localhost:3000', function (err, res, body) {
      if (err) return done(err)

      assert.equal(res.headers['content-type'], 'text/html')
      assert.equal(res.statusCode, 200)
      assert.equal(content, body)

      done()
    })
  })

  it('/GET exist file', (done) => {
    const content = fs.readFileSync('files/1.txt')

    request('http://localhost:3000/1.txt', function (err, res, body) {
      if (err) return done(err)

      assert.equal(content, body)

      done()
    })
  })

  it('/GET not exist file', (done) => {
    request('http://localhost:3000/notexist.txt', function (err, res) {
      if (err) return done(err)

      assert.equal(res.statusCode, 404)

      done()
    })
  })

  // don't work :(

  it('/POST file size limit exceeded', (done) => {
    // const file = fs.createReadStream('test/fixtures/2mb.pdf')

    // request
    //   .post('http://localhost:3000/2mb.pdf', file, function(err, res) {
    //     if (err) return done(err)
    //
    //     console.log(res.statusCode)
    //     // assert.equal(res.statusCode, 413)
    //     done()
    //   })

    request({
      method: 'POST',
      uri: `http://localhost:3000/2mb.pdf`,
      body: fs.createReadStream('test/fixtures/2mb.pdf'),
    }, (error, res) => {
      if (error) return done(error);

      res.statusCode.should.be.equal(413);
      setTimeout(() => {
        // можно и убрать sync
        fs.existsSync('test/fixtures//2mb.pdf').should.be.false();
        done();
      }, 20);

      done();
    });

    // fs
    //   .createReadStream('test/fixtures/2mb.pdf')
    //   .pipe(request.post('http://localhost:3000/2mb.pdf', function (err, res) {
    //     if (err) return done(err)
    //
    //     console.log(res.statusCode)
    //
    //     // assert.equal(response.statusCode, 413)
    //
    //     done()
    //   }))
  })

  it('/POST not exist file', (done) => {
    const file = fs.readFileSync('test/fixtures/1kb.txt')

    request
      .post('http://localhost:3000/1kb.txt', file, function(err, res) {
        if (err) return done(err)
        assert.equal(res.statusCode, 200)
        done()
      })
  })

  it('/POST exist file', (done) => {
    const file = fs.readFileSync('test/fixtures/1kb.txt')

    request
      .post('http://localhost:3000/1kb.txt', file, function(err, res) {
        if (err) return done(err)
        assert.equal(res.statusCode, 409)
        done()
      })
  })

  it('/DELETE not exist file', (done) => {

    request
      .delete('http://localhost:3000/notexist.txt', function(err, res) {
        if (err) return done(err)
        assert.equal(res.statusCode, 404)
        done()
      })
  })

  it('/DELETE exist file', (done) => {
    request
      .delete('http://localhost:3000/1kb.txt', function(err, res) {
        if (err) return done(err)
        assert.equal(res.statusCode, 200)
        done()
      })
  })
})

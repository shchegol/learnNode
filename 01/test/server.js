process.env.NODE_CONFIG_ENV = 'test'

const fs = require('fs-extra')
const request = require('request')
const config = require('config')
const should = require('should')
const Readable = require('stream').Readable;
const server = require('../server')
const hostname = config.get('hostname')
const port = config.get('port')
const publicRoot = config.get('publicRoot')
const filesRoot = config.get('filesRoot')
const host = `http://${hostname}:${port}`
const fixturesRoot = `${__dirname}/fixtures`

describe('Server', () => {
  before(done => {
    server.listen(port, hostname, done)
  })

  beforeEach(() => {
    fs.emptyDirSync(filesRoot)
  })

  after(done => {
    server.close(done)
  })

  describe('/GET', () => {
    it('index.html', done => {
      const content = fs.readFileSync(`${publicRoot}/index.html`, 'utf-8')

      request(host, function (err, res, body) {
        if (err) return done(err)

        res.headers['content-type'].should.be.equal('text/html')
        res.statusCode.should.be.equal(200)
        body.should.be.equal(content)

        done()
      })
    })

    context('file exist', () => {
      beforeEach(() => {
        fs.copySync(`${fixturesRoot}/1kb.txt`, `${filesRoot}/1kb.txt`)
      })

      it('returns 200 and the file', done => {
        const fixturesContent = fs.readFileSync(`${fixturesRoot}/1kb.txt`, 'utf-8')

        request(`${host}/1kb.txt`, function (err, res, body) {
          if (err) return done(err)

          res.statusCode.should.be.equal(200)
          body.should.be.equal(fixturesContent)

          done()
        })
      })
    })

    context('file not exist', () => {
      it('returns 404', done => {
        request(`${host}/1kb.txt`, function (err, res) {
          if (err) return done(err)

          res.statusCode.should.be.equal(404)

          done()
        })
      })
    })
  })

  describe('/POST', () => {
    context('file not exist', () => {
      it('returns 200 and is uploaded', (done) => {
        let file = fs.readFileSync(`${fixturesRoot}/1kb.txt`, 'utf-8')

        request
          .post({url: `${host}/1kb.txt`, body: file}, function (err, res) {
            if (err) return done(err)

            res.statusCode.should.be.equal(200)
            file.should.be.equal(fs.readFileSync(`${filesRoot}/1kb.txt`, 'utf-8'))

            done()
          })
      })
    })

    context('file exist', () => {
      beforeEach(() => {
        fs.copySync(`${fixturesRoot}/1kb.txt`, `${filesRoot}/1kb.txt`)
      })

      context('When zero file size', () => {
        it('returns 409 & file not modified', (done) => {
          let file = fs.readFileSync(`${fixturesRoot}/1kb.txt`, 'utf-8')
          let mtime = fs.statSync(`${filesRoot}/1kb.txt`).mtime

          request
            .post({url: `${host}/1kb.txt`, body: file}, function (err, res) {
              if (err) return done(err)

              let newMtime = fs.statSync(`${filesRoot}/1kb.txt`).mtime

              res.statusCode.should.be.equal(409)
              mtime.should.eql(newMtime)

              done()
            })
        })
      })

      context('When zero file size', () => {
        it('returns 409', done => {
          let req = request.post(`${host}/1kb.txt`, (err, res) => {
            if (err) return done(err)

            res.statusCode.should.be.equal(409)
            done()
          })

          // emulate zero-file
          let stream = new Readable()

          stream.pipe(req)
          stream.push(null)

        })
      })
    })

    context('file overweight', () => {
      it('returns 413 and the file did not appear', (done) => {
        let file = fs.readFileSync(`${fixturesRoot}/2mb.pdf`)

        request
          .post({url: `${host}/2mb.pdf`, body: file}, function (err, res) {
            if (err) return done(err)
            res.statusCode.should.be.equal(413)

            setTimeout(() => {
              fs.existsSync(`${filesRoot}/2mb.pdf`).should.be.false()
              done()
            }, 20)
          })
      })
    })

    context('otherwise with zero file size', () => {
      it('returns 200 & file is uploaded', done => {
        let req = request.post(`${host}/1kb.txt`, err => {
          if (err) return done(err)

          fs.statSync(`${filesRoot}/1kb.txt`).size.should.equal(0)

          done()
        })

        let stream = new Readable()

        stream.pipe(req)
        stream.push(null)
      })

    })
  })

  describe('/DELETE', () => {
    context('exist file', () => {
      beforeEach(() => {
        fs.copySync(`${fixturesRoot}/1kb.txt`, `${filesRoot}/1kb.txt`)
      })

      it('exist file', (done) => {
        request
          .delete(`${host}/1kb.txt`, function (err, res) {
            if (err) return done(err)

            res.statusCode.should.be.equal(200)
            fs.existsSync(`${filesRoot}/1kb.txt`).should.be.false()

            done()
          })
      })
    })

    context('not exist file', () => {
      it('not exist file', (done) => {
        request
          .delete(`${host}/1kb.txt`, function (err, res) {
            if (err) return done(err)

            res.statusCode.should.be.equal(404)

            done()
          })
      })
    })
  })
})

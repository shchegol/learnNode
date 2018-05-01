/**
 ЗАДАЧА
 Написать HTTP-сервер для загрузки и получения файлов
 - Все файлы находятся в директории files
 - Структура файлов НЕ вложенная.

 - Виды запросов к серверу
 GET / - index.html

 GET /file.ext
 - выдаёт файл file.ext из директории files,

 POST /file.ext
 - пишет всё тело запроса в файл files/file.ext и выдаёт ОК
 - если файл уже есть, то выдаёт ошибку 409
 - при превышении файлом размера 1MB выдаёт ошибку 413

 DELETE /file.ext
 - удаляет файл
 - выводит 200 OK
 - если файла нет, то ошибка 404

 Вместо file может быть любое имя файла.
 Так как поддиректорий нет, то при наличии / или .. в пути сервер должен выдавать ошибку 400.

 - Сервер должен корректно обрабатывать ошибки "файл не найден" и другие (ошибка чтения файла)
 - index.html или curl для тестирования

 */

const {createServer} = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')
const config = require('config')
const mime = require('mime')

module.exports = createServer((req, res) => {
  let pathname = decodeURI(url.parse(req.url).pathname)
  let filename = pathname.slice(1)
  let publicRoot = config.get('publicRoot')
  let filesRoot = config.get('filesRoot')

  if (filename.includes('/') || filename.includes('..')) {
    res.statusCode = 400
    res.end('Nested paths are not allowed')
    return
  }

  switch (req.method) {
    case 'GET':
      if (pathname === '/') {
        sendFile(`${ publicRoot }/index.html`, res)
      } else {
        let filepath = path.join(filesRoot, filename)
        sendFile(filepath, res)
      }

      break

    case 'POST':
      if (!filename) {
        res.statusCode = 404
        res.end('File not found')
      }

      receiveFile(path.join(filesRoot, filename), req, res)

      break

    case 'DELETE':
      if (!filename) {
        res.statusCode = 404
        res.end('File not found')
      }

      fs.unlink(path.join(config.get('filesRoot'), filename), err => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.statusCode = 404
            res.end('Not found')
          } else {
            console.error(err)
            res.statusCode = 500
            res.end('Internal error')
          }
        } else {
          res.statusCode = 200
          res.end('Ok')
        }
      })

      break

    default:
      res.statusCode = 502
      res.end('Not implemented')
  }
})

function receiveFile (filepath, req, res) {
  let limitFileSize = config.get('limitFileSize')

  if (req.headers['content-length'] > limitFileSize) {
    res.statusCode = 413
    res.end('File is too big!')
    return
  }

  let size = 0
  let writeStream = new fs.WriteStream(filepath, {flags: 'wx'})

  req
    .on('data', chunk => {
      size += chunk.length

      if (size > limitFileSize) {
        // res.statusCode = 413
        // res.setHeader('Connection', 'close')
        // res.end('File is too big!')
        //
        // writeStream.destroy()
        //
        // fs.unlink(filepath, err => {
        //   /* ignore error */
        // })

        res.writeHead(413, {'Connection': 'close'})
        res.end()
        fs.unlink(filepath, err => {
          console.log(err)
        })

      }
    })
    .on('close', () => {
      writeStream.destroy()
      fs.unlink(filepath, err => {
        console.log(err)
      })
    })
    .pipe(writeStream)

  writeStream
    .on('error', err => {
      if (err.code === 'EEXIST') {
        res.statusCode = 409
        res.end('File exists')
      } else {
        console.error(err)
        if (!res.headersSent) {
          res.writeHead(500, {'Connection': 'close'})
          res.end('Internal error')
        } else {
          res.end()
        }
        fs.unlink(filepath, err => { // eslint-disable-line
          /* ignore error */
        })
      }
    })
    .on('close', () => res.end('OK'))
}

function sendFile (filepath, res) {
  let fileStream = fs.createReadStream(filepath)
  fileStream.pipe(res)

  fileStream
    .on('error', err => {
      if (err.code === 'ENOENT') {
        res.statusCode = 404
        res.end('Not found')
      } else {
        console.error(err)
        if (!res.headersSent) {
          res.statusCode = 500
          res.end('Internal error')
        } else {
          res.end()
        }

      }
    })
    .on('open', () => {
      res.setHeader('Content-Type', mime.getType(filepath))
    })

  res
    .on('close', () => {
      fileStream.destroy()
    })
}
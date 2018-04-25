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

// mime <-> Content-Type

// Пример простого сервера в качестве основы

const url = require('url')
const fs = require('fs')
const path = require('path')
const config = require('config')
const {createServer} = require('http')

module.exports = createServer((req, res) => {
  const pathname = decodeURI(url.parse(req.url).pathname)
  const filename = pathname.slice(1)
  const publicRoot = config.get('publicRoot')
  const filesRoot = config.get('filesRoot')
  const limitFileSize = config.get('limitFileSize')

  console.log(pathname)
  console.log(filename)

  if (filename.includes('/') || filename.includes('..')) {
    res.statusCode = 400;
    res.end('Nested paths are not allowed');
    return;
  }

  switch (req.method) {
    case 'GET':
      if (pathname === '/') {
        const filePath = path.join(__dirname, 'public', 'index.html')
        const fileStream = fs.createReadStream(filePath)
        fileStream.pipe(res)
      } else {

      }

      break

    case 'POST':
      console.log('post')

      break

    case 'DELETE':
      console.log('delete')

      break

    default:
      res.statusCode = 502
      res.end('Not implemented')
  }

})
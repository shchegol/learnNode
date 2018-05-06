// слишком простой чат, в коде есть минимум 7 серьёзных ошибок - КАКИХ?
const http = require('http');
const fs = require('fs');

let clients = [];

http.createServer((req, res) => {

  switch (req.method + ' ' + req.url) {
    case 'GET /':
      // 1. обработка ошибок
      // 2. обрыв соединения
      fs.createReadStream('index.html').pipe(res);
      break;

    case 'GET /subscribe':
      console.log("subscribe");
      // может стоит определять существование клиента
      // 3. обрыв соединения
      clients.push(res);
      break;

    case 'POST /publish':
      let body = '';

      req
        .on('data', data => {
          // 4. проверка размера
          // 5. кодировка
          body += data;
        })
        .on('end', () => {
          // 6. проверка на валидность
          body = JSON.parse(body);

          // {"message": 1}

          console.log("publish '%s'", body.message);
          // массив может быть слишком большой
          clients.forEach(res => {
            // 7. привести к строке
            res.end(body.message);
          });

          clients = [];

          res.end("ok");
        });

      break;

    default:
      res.statusCode = 404;
      res.end("Not found");
  }


}).listen(3000);
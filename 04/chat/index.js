const Koa = require('koa');
const app = new Koa();
const config = require('config');
const path = require('path');
const fs = require('fs');
const Router = require('koa-router');
const router = new Router();
const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
let clients = [];

handlers.forEach(handler => require('./handlers/' + handler).init(app));

router.get('/subscribe', async ctx => {
  ctx.set('Cache-Control', 'no-cache')

  ctx.body = await new Promise((res) => {
    clients.push(res);

    ctx.res.on('close', function() {
      clients.splice(clients.indexOf(res), 1);
      res();
    });
  });
})

router.post('/publish', async ctx => {
  const message = ctx.request.body.message

  if (!message) ctx.throw(400, 'message is required!')

  clients.forEach(client => client(String(message)))

  clients = [];
  ctx.body = 'ok'
})

app.use(router.routes());

app.listen(config.get('port'));

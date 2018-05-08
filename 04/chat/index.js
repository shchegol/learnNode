const Koa = require('koa');
const app = new Koa();

const config = require('config');

const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => {
  const h = require('./handlers/' + handler);
  h.init(app);
});

// // can be split into files too
const Router = require('koa-router');

const router = new Router();

router.get('/views', async function(ctx, next) {
  let count = ctx.session.count || 0;
  ctx.session.count = ++count;

  ctx.body = ctx.render('./templates/index.pug', {
    user: 'John',
    count: count
  });
});


// параметр ctx.params
// см. различные варианты https://github.com/pillarjs/path-to-regexp
//   - по умолчанию 1 элемент пути, можно много *
//   - по умолчанию обязателен, можно нет ?
//   - уточнение формы параметра через regexp'ы
router.get('/user/:user', async function(ctx, next) {
  ctx.body = "Hello, " + ctx.params.user;
});

router.get('/', async function(ctx) {
  ctx.redirect('/views');

  // ctx.body = '1';
});

app.use(router.routes());

app.listen(config.get('port'));

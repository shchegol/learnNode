// The simplest example of Koa

const Koa = require('koa');

const app = new Koa();

/**
 * Основные объекты:
 * ctx.req / ctx.res
 * ctx.request / ctx.response
 * ctx (контекст)
 *
 * Основные методы:
 * ctx.set/get
 * ctx.body=
 */

// app._middlewares = [m1, m2, m3]
// .use == .push

app.use(async function(ctx, next) { // context = {}

  /* sleep(1000); */
  await new Promise(res => setTimeout(res, 1000));

  // ctx.response.body = "hello"
  ctx.body = {result: "hello"};

});

app.listen(3000);

// Typical middleware examples

const Koa = require('koa');
const fs = require('mz/fs');
const app = new Koa();

// 1 -> 2 -> 3 -> 1

// 1. Wrap into a meta async function (count time, catch errors...)
app.use(async function(ctx, next) {
  console.log('--> request start', ctx.url);

  let time = new Date();

  await next();

  time = new Date() - time;

  console.log('<-- request end', time, 'ms');
  // response body may be not yet fully sent out,
  // use on-finished for that (or see koa-logger how to track full body length)
});

// 2. Add goodies to ctx (or ctx.request/response, but not req/res)
app.use(function(ctx, next) {
  console.log('--> add useful method to ctx');

  ctx.renderFile = async function (file) {
    ctx.body = await fs.readFile(file, 'utf-8');
  };

  return next();

});

// 3. Do the work, assign ctx.body (or throw)
app.use(async function(ctx, next) {
  console.log('--> work, work!');

  if (ctx.url != '/') {
    ctx.throw(404); // throw new Error();
  }

  await ctx.renderFile(__filename); // если без await, то не сработает!

  console.log('<-- work complete!');
});

app.listen(3000);

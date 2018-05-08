
// Usually served by Nginx
const favicon = require('koa-favicon');

exports.init = app => app.use(favicon('public/favicon.ico'));

// app.use((ctx, next) => {
//   if ('/favicon.ico' != ctx.path) {
//     return next();
//   }
//
//   // lazily read the icon
//   if (!icon) icon = fs.readFileSync(path);
//   ctx.set('Cache-Control', cacheControl);
//   ctx.type = 'image/x-icon';
//   ctx.body = icon;
// });

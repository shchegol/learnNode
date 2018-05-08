// in-memory store by default (use the right module instead)
const session = require('koa-session');

/*
const sessions = {
  id1: {name: '', count: 4},
  id2: {name: '', count: 1},
};

sid: id1

ctx.session = {name: '', count: 4}

*/

exports.init = app => app.use(session({
  signed: false
}, app));

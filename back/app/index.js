const Koa = require('koa');
const koaBody=require('koa-body');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const koaStatic = require('koa-static');
const mongoose = require('mongoose');
const path = require('path')
const cors = require('koa2-cors');
const app = new Koa();
const routing = require('./routes')
const { connectionStr } = require('./config')

mongoose.set('useFindAndModify', false)
mongoose.connect(connectionStr, { useUnifiedTopology: true, useNewUrlParser: true }).then(
  () => console.log('MongoDB连接成功！'),
  err => { 
    console.log(err)  
  }
).catch(err => {
  console.log(err);
})
mongoose.connection.on('error', console.error)
app.use(
  cors({
      origin: function(ctx) { //设置允许来自指定域名请求
        return '*'; //只允许http://localhost:8080这个域名的请求
      },
      maxAge: 5, //指定本次预检请求的有效期，单位为秒。
      credentials: true, //是否允许发送Cookie
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
      allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
      exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
  })
);
app.use(koaStatic(path.join(__dirname, 'public')));
app.use(error({
  postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest: {stack, ...rest}
}))
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads'),
    keepExtensions: true,
  }
}));
app.use(parameter(app));
routing(app);

app.listen(3001, () => {
  console.log(`程序已启动
http://localhost:3001`)
});
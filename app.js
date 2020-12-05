const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const ueditor = require("ueditor")

const logger = require('morgan');

const MySQLStore = require('express-mysql-session')(session);

const indexRouter = require('./routes/index.js');
const usersRouter = require('./routes/users.js');
const adminRouter = require('./routes/admin.js');
const newsRouter = require('./routes/news.js');

const conn = require("./config/database.config.js")

const app = express();

// view engine setup
app.engine('html', require('express-art-template'));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));
app.use('/jquery', express.static('./node_modules/jquery/dist'));
app.use('/public/uploads', express.static('./public/uploads'))

const options = {}
var sessionStore = new MySQLStore(options/* session store options */, conn);

app.use(session({
  secret: 'db_admin',
  resave: false,
  store:sessionStore,
  saveUninitialized: true,
  cookie: {
    // maxAge: 60*60*1000*24
  }
}));

app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
  let d = new Date();
  var imgDir = '/uploads/'+ d.getFullYear() + (d.getMonth() + 1) + d.getDate(); //默认上传地址为图片
  var ActionType = req.query.action;
  if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
    var file_url = imgDir;//默认上传地址为图片
    /*其他上传格式的地址*/
    if (ActionType === 'uploadfile') {
      file_url = '/file/ueditor/'; //附件保存地址
    }
    if (ActionType === 'uploadvideo') {
      file_url = '/video/ueditor/'; //视频保存地址
    }
    res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    res.setHeader('Content-Type', 'text/html');
  }
  //客户端发起图片列表请求
  else if (ActionType === 'listimage'){

    res.ue_list(imgDir);  // 客户端会列出 dir_url 目录下的所有图片
  }
  // 客户端发起其它请求
  else {
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/ueditor/nodejs/config.json')
  }}));


app.use('/', indexRouter);
app.use('/', newsRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;
app.listen(3000, function(){
  console.log('running...');
});

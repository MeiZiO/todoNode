var express = require('express')
var router = require('./router');
var app = express()


var path = require('path');
var bodyParser = require('body-parser');//用于req.body获取值的
app.use(bodyParser.json());
// 创建 application/x-www-form-urlencoded 编码解析
app.use(bodyParser.urlencoded({ extended: true }));


//导入cors模块,该模块为跨域所用
const cors = require('cors');
app.use(cors());


app.use(router);

app.listen(3000, function () {
  console.log('正在监听本地3000端口，running');
});
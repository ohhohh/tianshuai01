var express = require('express');
var router = express.Router();
const conn =require("../config/database.config.js")

/* GET home page. */
router.get('/', function(req, res, next) {
  let sql = `select * from news where status = 1 order by id desc `;
  conn.query(sql,function (err,result) {
    res.render('index', { title: '公司名称',news_list:result });
  })

});

module.exports = router;

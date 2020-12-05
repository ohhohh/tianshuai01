var express = require('express');
var router = express.Router();
const conn =require("../config/database.config.js")

/* GET home page. */
router.get('/news/:id', function(req, res, next) {
    // res.render('/index', { title: 'Express' });
    console.log(req.params.id);
    let sql = "select * from news where id="+req.params.id;
    conn.query(sql,function (err,result) {
        res.render("news", {news: result[0]})
    })

    // res.render("news");
});

module.exports = router;

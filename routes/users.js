var express = require('express');
var router = express.Router();
const conn = require("../config/database.config.js")

/* GET users listing. */
router.get('/', function (req, res, next) {
  // res.send('respond with a resource');
  let sql = "select * from student ";
  conn.query(sql, function (error, result) {
    if (!error) {
      res.render("admin/admin_list",{

        userlist:result
      });
    }
  })

});



router.get("/add.html",function (req,res) {
  res.render("add");
})

router.post("/add",function (req,res) {
  // console.log(req.body);
  let cid = req.body.cid;
  let username = req.body.username;
  let password = req.body.password;
  let sex = req.body.sex;
  let miaoshu = req.body.miaoshu;
  let hobby = req.body.hobby;
  let sql = "insert into student(cid,username , password ,gender,miaoshu,hobby, create_time) values('"+cid+"','"+ username +"','"+ password+"','"+ sex +"','"+miaoshu+"','"+ hobby +"',now())"
  conn.query(sql,function (err,result) {
    console.log(cid);
    res.redirect("/users");
  })
})

router.get("/del",function (req,res) {
  // console.log(req.url);
  let id = req.query.did;
  let sql = `delete from student where id=${id}`;
  conn.query(sql,function (err,result) {
    res.redirect("/users");
  })
})

router.get("/edit",function (req,res) {
  let id = req.query.eid;
  let sql = `select * from student where id=${id}`;
  conn.query(sql,function (err,result) {
    // console.log(result)
    res.render("admin/edit",{
      user:result[0]
    })
  })
})

router.post("/edit",function (req,res) {
  let id = req.body.eid;
  let cid = req.body.cid;
  let username = req.body.username;
  let password = req.body.password;
  let sex = req.body.sex;
  let miaoshu = req.body.miaoshu;
  let hobby = req.body.hobby;
  // console.log(sex);
  let sql = `update student set username= '${username}' , password= '${password}',gender='${sex}',hobby='${hobby}',miaoshu='${miaoshu}',cid='${cid}' where id=${id}`;
  conn.query(sql,function (err,result) {
    // console.log(err);
    res.redirect("/users");
  })
})


module.exports = router;

const express = require('express');
const router = express.Router();
const conn = require("../config/database.config.js")
const common = require("../common/common.js");
const multer = require("multer");
const path = require("path");
const chk_login = require('../middleware/chk_login.js');
const {setMd5} = require("../common/common.js");

router.use((req, res, next) => {
    if (req.body.remember) {
        req.session.cookie.maxAge = 60 * 60 * 1000 * 24;
    }
    // if (req.cookies["connect.sid"]) {
    //     let sql = `select * from session where id=${req.cookies["connect.sid"]}`

    // conn.query(sql,function (err,result) {
    //         console.log(result[0].session_val);
    //         req.session = JSON.parse(result[0].session_val);

    // })
    // }
    next();
})

router.use(chk_login());

/* GET home page. */
let d = new Date();
var storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     let d = new Date();
    //     cb(null, "./public/uploads" + d.getFullYear() + (d.getMonth() + 1) + d.getDate());
    // },
    destination: "./public/uploads"+ d.getFullYear() + (d.getMonth() + 1) + d.getDate(),
    filename: function (req, file, cb) {
        let extName = path.extname(file.originalname);
        console.log(extName);
        cb(null, file.fieldname + "-" + Date.now() + extName);
    },
});

var upload = multer({storage: storage});


router.get('/', function (req, res, next) {
    res.render('admin/index', {title: 'Express', admin: req.session.admin});
});

router.get("/login.html", function (req, res) {
    res.render("admin/login", {title: "企业管理系统"});
})

router.get('/main.html', function (req, res) {
    res.render('admin/main');
});
router.get('/password.html', function (req, res) {
    res.render('admin/password');
});
router.get('/admin_list.html', function (req, res) {
    let sql = "select * from admin ";
    conn.query(sql, function (error, result) {
        res.render("admin/admin_list", {
            admin_list: result
        });
    })

});

router.get("/add.html", function (req, res) {
    res.render("admin/add", {title: "添加管理员"});
});

router.get('/logout', function (req, res) {
    req.session.destroy();
    res.clearCookie('connect.sid')
    res.send('<script>alert("退出成功"); top.location="/admin/login.html"</script>');
});

router.post("/login", function (req, res) {

    let admin_name = req.body.admin_name;
    let admin_password = req.body.admin_password;

    let sql = "select * from admin where admin_name='" + admin_name + "'";
    // console.log(sql);
    conn.query(sql, function (error, result) {
        if (error) {
            return res.send(error.toString());
        }

        if (result.length == 0) {
            return res.send(
                '<script>alert("用户名或密码不正确"); history.back()</script>'
            );
        }

        let pwd_database = result[0].admin_password;

        let admin_salt = result[0].admin_salt;

        let pwd_post = common.setMd5(admin_password, admin_salt);
        if (pwd_database != pwd_post) {
            return res.send('<script>alert("用户名或密码不正确"); history.back()</script>');
        }

        req.session.admin = result[0];

        let session_val = JSON.stringify(req.session);
        let maxAge = req.session.cookie.expires;
        let session_id = req.cookies["connect.sid"];
        // console.log(req.session);
        // console.log(req.cookies["connect.sid"])


        // console.log(sql);

        // if (req.body.remember) {
        //     let sql = `insert into session values('${session_id}','${maxAge}','${session_val}',now())`;
        //
        //     conn.query(sql,function (err,result) {
        //         if (err) {
        //             console.log(err);
        //         }
        //         console.log(result);
        //     })
        // }


        return res.send(
            '<script>alert("登录成功"); location.href="/admin"</script>'
        );
    });
});

router.post('/password', function (req, res) {
    // console.log(req.body);

    let admin_name = req.session.admin.admin_name;
    let sql = "select * from admin where admin_name='" + admin_name + "'";
    conn.query(sql, function (error, result) {
        if (error) {
            return res.send(error.toString())
        }

        let pwd_database = result[0].admin_password;

        let admin_salt = result[0].admin_salt;

        let pwd_post = common.setMd5(req.body.admin_password, admin_salt);
        if (pwd_database != pwd_post) {

            return res.send('<script>alert("原始密码不正确"); history.back()</script>');
        }
        if (req.body.new_password != req.body.confirm_password) {
            return res.send('<script>alert("两次密码不一致"); history.back()</script>');
        }

        let new_salt = common.getRandomNumber();
        let new_password = setMd5(req.body.new_password, new_salt);
        let sql = `update admin set admin_password='${new_password}', admin_salt='${new_salt}' where id = ${result[0].id}`;
        conn.query(sql, function (error, result) {
            console.log(result);
            if (result) {
                // res.redirect('/admin/logout');
                return res.send('<script>alert("密码修改成功, 请重新登录"); location.href="/admin/logout"</script>');
            }
        });
    });
});

router.post('/add', upload.single('admin_avatar'), function (req, res) {

    console.log(req.body);
    console.log(req.file);

    let avatar = req.file.filename;
    let sql = `select id from admin where admin_name='${req.body.admin_name}'`;
    conn.query(sql, function (error, result) {
        if (error) {

        }
        // console.log(result[0]);
        if (result[0]) {
            return res.send("<script>alert('用户名已存在'); history.back();</script>");
        }

        if (req.body.admin_password && (req.body.admin_password != req.body.admin_password_confirm)) {
            return res.send("<script>alert('两次密码不一致'); history.back();</script>");
        }
        let admin_salt = common.getRandomNumber();
        let admin_password = common.setMd5(req.body.admin_password, admin_salt);
        let sql = "insert into admin(admin_name, admin_password, admin_salt, admin_avatar, admin_role, create_time) values(?, ?, ?, ?, ?, now())";

        conn.query(sql, [req.body.admin_name, admin_password, admin_salt, req.file.path, req.body.admin_role], function (error, result) {
            if (error) {
                return res.send(error.toString());
            }
            if (result) {

            }
            res.send("<script>alert('添加成功'); window.location.href='/admin/admin_list.html'</script>");
        });
    });
});


function getTree(data, pid, lv) {
    let result = [];
    if (data && typeof data == "object") {
        for (var index in data) {
            if (data[index].parent_id === pid) {
                result.push(data[index]);
                result = result.concat(getTree(data, data[index].id, lv + 1));
            }
        }
    }
    return result;
}

router.get("/demo", function (req, res) {
    let sql = `select * from category`
    conn.query(sql, function (err, result) {
        // console.log(getTree(result ,0));
        // let list  = getTree(result,0);
        res.render("admin/demo", {
            cat_list: getTree(result, 0),
            // cat_list: list,
        })
    });

})
router.get("/del_cat/:id", function (req, res) {
    // console.log(req.params);
    let sql = "select * from category"
    conn.query(sql, function (err, result) {
        let list = getTree(result, req.params.id);
        let idArr = list.map(function (item) {
            return item.id;
        })
        idArr.push(req.params.id);
        console.log(idArr);
        let str = "(" + idArr.join(",") + ")";
        console.log(str);
        let sql = "delete from category where id in " + str;
    })
})

router.get("/news", function (req, res) {

    res.render("admin/news");
})

router.post("/news_add", upload.single("imgs"), function (req, res) {
    // console.log(req.file);
    // console.log(req.body);
    // res.send(req.body.content);
    let title = req.body.title;
    let img_thumbs = req.file.filename;
    let content = req.body.content;
    let sql = `insert into news(title,sub_title,keyWords,description,content,catagory,img_thumbs,author,resource,hot,views,create_time ) values(?,?,?,?,?,?,?,?,?,?,?,now() )`;
    conn.query(sql,[title,title,title,title,content,4,img_thumbs,req.session.admin.admin_name,"db_admin",1,999],function (err,result) {
        res.send(result);
    })
});


router.get("/page/:page",function (req,res) {
    let sql = `select * from category`;
    conn.query(sql,function (err,result) {
        let total = result.length;
        let num = 3;
        let pages = Math.ceil(total/num);
        let page_views = "";
        let page = req.params.page;
        for (var i = 1; i <= pages; i++) {
            if (i==page){
                page_views += `<li><span>${i}</span></li>`
            }else {
                page_views += `<li><a href="/admin/page/${i}" >${i}</a></li>`
            }

        }
        if (page < 1) {
            page = 1;
        }
        if (page > pages) {
            page = pages;
        }

        let sql = `select * from category limit ${(page-1)*num}, ${num}`;
        conn.query(sql,function (e,lists) {
            res.render("admin/page",{
                lists:lists,
                page_views:page_views,
                page:page,
                pages:pages,
                total:total
            })
        })

    })
})
module.exports = router;

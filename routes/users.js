var express = require('express');
var async = require("async");
var MongoClient = require("mongodb").MongoClient; //引入
var ObjectId = require("mongodb").ObjectId;
var url = "mongodb://127.0.0.1:27017";
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
   //操作数据库
   var page=parseInt(req.query.page||1);//前端传过来的页码
   var pagesize=parseInt(req.query.pagesize||5);//每页显示的条数
   var totalsize=0;//总条数 需要自己查询数据库

  MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
    if(err){
      res.render("error",{
        message:"连接数据库失败",
        error:err
      })
      return;
    }
    var db=client.db("2010");//连接数据库
  
    async.series([
      function(cb){
        db.collection("server").find().count(function(err,num){
          if(err){
            cb(err)
          }else{
            totalsize=num;
            cb(null);
          }
        })
      },
      function(cb){
        var index=page*pagesize-pagesize
        db.collection("server").find().limit(pagesize).skip(index).toArray(function(err,data){
          if(err){
            cb(err);
          }else{
            cb(null,data)
          }
        });
      }
    ],function(err,results){
      if(err){
        res.render("error",{
          message:"查询失败",
          error:err
        })
        return;
      }else{
        var totalpage = Math.ceil(totalsize/pagesize);//向上取整
        res.render("users",{
          list:results[1],
          totalpage:totalpage,
          pagesize:pagesize,
          page:page
        })
        console.log(page)
        client.close()
      }
    })
  })

 
  
  // MongoClient.connect(url, {
  //   useNewUrlParser: true
  // }, function (err, client) { //连接数据库connect
  //   if (err) { //useNewUrlParser:true要设置第二个参数不会报错了
  //     res.render("error", {
  //       message: "连接数据库失败",
  //       error: err
  //     })
  //     return;
  //   }
  //   var db = client.db("2010"); //传入数据库的名字   
  //   db.collection("server").find().toArray(function (err, data) { //选择露出来
  //     if (err) {
  //       要操作的合集以一个数组的方式暴
  //       res.render("error", { //渲染到前端页面
  //         message: "查询失败",
  //         error: err
  //       })
  //     } else {
  //       res.render("users", {
  //         list: data
  //       })
  //     }
  //     client.close() //完成一系列操作停止连接数据库
  //   })
  // });
});
//登录操作请求

router.post("/login", function (req, res, next) {
  var uname = req.body.uname;
  var pwd = req.body.pwd;
  // console.log(req.body)
  // console.log(username)
  if (!uname) {
    res.render(error, {
      message: "用户名输入错误",
      error: new Error("用户名输入错误")
    })
    return;
  }
  if (!pwd) {
    res.render(error, {
      message: "密码错误",
      error: new Error("密码错误")
    })
    return;
  }
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      res.render(error, {
        message: "连接失败",
        error: err
      })
      return;
    }
    var db = client.db("2010");
    db.collection("server").find({
      name: uname,
      pwd: pwd
    }).toArray(function (err, data) {
      if (err) {
        res.render(error, {
          message: "查询失败",
          error: err
        })
        return;
      } else if (data.length <= 0) {
        res.render("error", {
          message: "登录失败",
          error: new Error("登录失败")
        })
      } else {
        res.cookie("nickname", data[0].nickname, { //设置cookie的时间等
          maxAge: 120 * 60 * 1000
        })
        res.redirect("/");
      }
      client.close();
    })
  });


  //   db.collection("server").find({name:uname,pwd:pwd}).count(function(err,num){
  //     console.log(num)                                //count(用于查询数据库条数的)
  //     if(err){                                    
  //       res.render(error,{
  //         message:"查询失败",
  //         error:err
  //       })
  //     }else if(num>0){
  //       //登录成功写入Cookie
  //       res.cookie("nickname",)

  //       res.redirect("http://localhost:3000/");//使用重定向这是跳转
  //     }else{
  //       res.render("error",{
  //         message:"登录失败",
  //         error:new Error("登录失败")
  //       })
  //     }
  //     client.close()//关闭连接
  //   });
  // })
});
router.post("/ages", function (req, res, next) {
  var uname = req.body.uname;
  var pwd = req.body.pwd;
  var spwd = req.body.spwd;
  var username = req.body.username;
  var sex = req.body.sex;
  var isadmin = req.body.isadmin === "是" ? true : false;
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      res.render(error, {
        message: "连接失败",
        error: err
      })
      return;
    }
    var db = client.db("2010");
    async.series([
      function (cb) {
        db.collection("server").find({
          name: uname
        }).count(
          function (err, num) {
            if (err) {
              cb(err);
            } else if (num > 0) {
              cb(new Error("已经注册过了"))
            } else {
              cb(null);
            }
          }
        )
      },
      function (cb) {
        db.collection("server").insertOne({
          name: uname,
          pwd: pwd,
          nickname: username,
          sex: sex,
          isAdmin: isadmin
        }, function (err) {
          if (err) {
            cb(err);
          } else {
            cb(null);
          }
        })
      }
    ], function (err, result) {
      if (err) {
        res.render("error", {
          message: "错误",
          error: err
        })
      } else {
        res.redirect("/");
      }
      client.close();
    })
  })
  // MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
  //   if(err){
  //     console.log("连接失败",error)
  //     res.render(error,{
  //       message:"连接失败",
  //       error:err
  //     })
  //     return;
  //   }
  //   var db = client.db("2010");yarn
  //   db.collection("server").insertOne({
  //     name:uname,
  //     pwd:pwd,
  //     nickname:username,
  //     sex:sex,
  //     isAdmin:isadmin
  //   },function(err){
  //     if(err){
  //       res.render("error",{
  //         message:"注册失败",
  //         error:err
  //       })
  //     }else{
  //       res.redirect("/");
  //     }
  //   })
  //   client.close();
  // })
})

router.get("/delete", function (req, res) {
  var id = req.query.id;
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      res.render("error", {
        message: "连接失败",
        error: err
      })
      return;
    }
    var db = client.db("2010");
    db.collection("server").deleteOne({
      _id: ObjectId(id)
    }, function (err) {
      if (err) {
        res.render("error", {
          message: "删除失败",
          error: err
        })
      } else {
        res.redirect("/users");
      }
      client.close();
    })
  })
})


module.exports = router;
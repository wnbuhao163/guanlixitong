var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.get("/user.html",function(req,res,next){
//   res.render("user");
// });

router.get("/brand.html",function(req,res,next){
  res.render("brand");
});

router.get("/phone.html",function(req,res,next){
  res.render("phone");
});
//登录页面
router.get("/login.html",function(req,res,next){
  res.render("login");
});

router.get("/ages.html",function(req,res,next){
  res.render("ages");
});
module.exports = router;

const express = require('express');
const router = express.Router();
const userModel = require('./users'); // Replace with the actual path
const postsModel = require('./posts'); // Replace with the actual path
const passport = require('passport');
const storage =  require('./multer')

const localstrategy =  require("passport-local");
const upload = require('./multer');
passport.use(new localstrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts")
  // console.log(user)
  res.render('profile',{user});
});
router.get('/feed', isLoggedIn, function(req, res, next) {
  res.render('feed');
});
router.get('/uploadpost', isLoggedIn, function(req, res, next) {
  res.render('uploadpost');
});
router.post('/upload',isLoggedIn, upload.single('file'), async function(req, res) {
  if(!req.file){
    res.status(404).send('No file were uploaded')
  }
  const user = await userModel.findOne({username:req.session.passport.user})
  const post = await postsModel.create({
  image:req.file.filename,
  imageText:req.body.filecaption,
  userId:user._id
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect('/profile')
});
router.get('/login', function(req, res, next) {
  // console.log(req.flash('error'))
  res.render('login', {error:req.flash('error')});
});


router.post('/register',  function(req, res){
let userdata = new userModel({
  username:req.body.username,
  email:req.body.email,
  fullname:req.body.fullname
})

userModel.register(userdata, req.body.password)
.then(function(){
  passport.authenticate("local")(req,res, function(){
    res.redirect("/profile");
    })
  }) 
})



// router.post('/login', passport.authenticate("local", {
//   successRedirect: "/profile",
//   failureRedirect: "/login",
// }));
router.post('/login', passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}),function(req, res){});



router.get('/logout', function(req, res, next) {
  req.logout(function(err){
    if(err) { return next(err)}
  }); // This is sufficient to log the user out
  res.redirect('/login');
});


function isLoggedIn(req, res,next){
  if(req.isAuthenticated()) return next();
  res.redirect('/login')
  
}
// router.get('/alluserdata', async function(req, res, next) {
//   let alldata = await userModel.findOne({_id:'6553a467987b74215b6e3b77' })
//   .populate('posts')
//   res.send(alldata)
// });

// router.get('/createuser', async function(req, res, next) {
//   try {
//     let createdUser = await userModel.create({
//       username: "Arun",
//       password: "Arun",
//       posts: [],
//       email: 'lovearun010@gmail.com',
//       fullName: "Arun Prajapati",
//     });

//     res.send(createdUser);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error creating user');
//   }
// });
// router.get('/createpost', async function(req, res, next) {
//   let createdpost= await postsModel.create({
//     postText:"hello kese ho sb",
//     userId:'6553a467987b74215b6e3b77',
//   });
//   let user = await userModel.findOne({_id:"6553a467987b74215b6e3b77"})
//   user.posts.push(createdpost._id)
//   await user.save();
//   res.send("done")
// });

module.exports = router;

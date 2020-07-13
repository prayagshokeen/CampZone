var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var Campground = require("./models/campground.js");
var seedDb = require("./seeds.js");
var Comment = require("./models/comment"),
   passport = require("passport"),
   LocalStrategy = require("passport-local"),
   flash = require("connect-flash"),
   User = require("./models/user");

var commentRoutes  = require("./Routes/comments"),
 campgroundRoutes = require("./Routes/campgrounds"),
        authRoutes = require("./Routes/auth");

//seedDb();
mongoose.connect("mongodb+srv://YelpCamp:jaskhshokeen@cluster0.5exye.mongodb.net/<dbname>?retryWrites=true&w=majority",  { useNewUrlParser: true ,  useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


app.locals.moment = require('moment');

//Passport Configuration
app.use(require("express-session")({
	secret: "I want to win Mr. Delhi Title!!",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


//all routes
app.use(campgroundRoutes);
app.use(authRoutes);
app.use(commentRoutes);

//   ********db.campgrounds.drop() is used to delete all the data stored in the data base


app.listen(3000, function(){
	console.log("Yelp Camp Server has started!!!!");
});

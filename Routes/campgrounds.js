var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleWare");

//INDEX - show all campgrounds
router.get("/campgrounds", function(req, res){
	//GEt all Campgrounds from DB
	var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
	Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
        Campground.countDocuments().exec(function (err, count) {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", {
                    campgrounds: allCampgrounds,
					currentUser: req.user,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage)
                });
            }
        });
    });
});


//create - add a new campground to DB
router.post("/campgrounds", middleware.isLoggedIn, function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var price = req.body.price;
	var description = req.body.description;
	var author={
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name,price: price, image: image, description: description, author: author};
    //create a new campgroundand save to database
    Campground.create(newCampground, function(err, newlyCreated){
    	if(err){
    		console.log(err);
    	}
    	else{
    		res.redirect("/campgrounds");
    	}
    });
});

router.get("/campgrounds/new", middleware.isLoggedIn,  function(req, res){
	res.render("campgrounds/new");
})

router.get("/campgrounds/:id", function(req, res){
	//find the campgrounds with given id
	Campground.findById(req.params.id).populate("comments likes").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		}
		else {
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
	//render show template with that campgrounds
});

//Campground Like Route
router.post("/campgrounds/:id/like", middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err);
			return res.redirect("/campgrounds");
		}
		//check if req.user._id exists in foundCampground.likes
		var foundUserLike = foundCampground.likes.some(function(like){
			return like.equals(req.user._id);
		});
		
		if(foundUserLike){
			//user already liked it , removing like
			foundCampground.likes.pull(req.user._id);
		} else {
			// adding new user like
			foundCampground.likes.push(req.user);
		}
		
		foundCampground.save(function(err){
			if(err){
				console.log(err);
				return res.redirect("/campgrounds");
			}
			return res.redirect("/campgrounds/" + foundCampground._id);
		});
	});
});

//Edit Campground Route
router.get("/campgrounds/:id/edit",middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			req.flash("error", "Campground not found");
		}
		else 
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});


//Update Route
router.put("/campgrounds/:id",middleware.checkCampgroundOwnership, function(req, res){
	//find and update the correct campground
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			redirect("/campgrounds");
		}
		else{
			campground.name = req.body.campground.name;
			campground.description = req.body.campground.description;
			campground.image = req.body.campground.image;
			campground.save(function(err){
				if(err){
					res.redirect("/campgrounds");
				} else {
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		}
		else {
			req.flash("success", "Campground deleted")
			res.redirect("/campgrounds");
		}
	});
});



module.exports = router;

var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");
var middleWare = require("../middleWare");


//image  upload code---------------------------------
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'di5swgl9o', 
  api_key: 936698783268746, 
  api_secret: '9yIivhUtP0pV3ccQ7sS7zCsR9q4'
});
//---------------------------------------------------


//INDEX - show all campgrounds
router.get("/campgrounds", function(req, res){
	
	if (req.query.paid) res.locals.success = 'Payment succeeded, welcome to YelpCamp!';
	
	//GEt all Campgrounds from DB
	var noMatch = null;
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        var perPage = 8;
		var pageQuery = parseInt(req.query.page);
		var pageNumber = pageQuery ? pageQuery : 1;
		Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
			Campground.countDocuments({name: regex}).exec(function (err, count) {
				if (err) {
					console.log(err);
				} else {
					res.render("campgrounds/index", {
						campgrounds: allCampgrounds,
						currentUser: req.user,
						current: pageNumber,
						pages: Math.ceil(count / perPage), 
						noMatch: noMatch
					});
				}
			});
		});
	}else {
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
						pages: Math.ceil(count / perPage), 
						noMatch: noMatch
					});
				}
			});
		});
	}
});


//create - add a new campground to DB
router.post("/campgrounds", middleWare.isLoggedIn, upload.single('image'), function(req, res) {
	// var name = req.body.name;
	// var image = req.body.image;
	// var price = req.body.price;
	// var description = req.body.description;
	// var author={
	// 	id: req.user._id,
	// 	username: req.user.username
	// }
	// var newCampground = {name: name,price: price, image: image, description: description, author: author};
	// //create a new campgroundand save to database
	// Campground.create(newCampground, function(err, newlyCreated){
	// if(err){
	// console.log(err);
	// }
	// else{
	// res.redirect("/campgrounds");
	// }
	// });
	
	//--------------------------
	// cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
	// if(err) {
	// req.flash('error', err.message);
	// return res.redirect('back');
	// }
	// // add cloudinary url for the image to the campground object under image property
	// req.body.campground.image = result.secure_url;
	// // add image's public_id to campground object
	// req.body.campground.imageId = result.public_id;
	// // add author to campground
	// req.body.campground.author = {
	// id: req.user._id,
	// username: req.user.username
	// }
	// Campground.create(req.body.campground, function(err, campground) {
	// if (err) {
	// req.flash('error', err.message);
	// return res.redirect('back');
	// }
	// res.redirect('/campgrounds/' + campground.id);
	// });
	// });
	//===================
	
	
	cloudinary.uploader.upload(req.file.path, function(result) {
	// add cloudinary url for the image to the campground object under image property
	req.body.campground.image = result.secure_url;
	req.body.campground.imageId = result.public_id;
	// add author to campground
	req.body.campground.author = {
		id: req.user._id,
		username: req.user.username
	}
	Campground.create(req.body.campground, function(err, campground) {
	if (err) {
	  req.flash('error', err.message);
	  return res.redirect('back');
	}
	res.redirect('/campgrounds/' + campground.id);
	});
});
});

router.get("/campgrounds/new", middleWare.isLoggedIn,  function(req, res){
	res.render("campgrounds/new");
})

router.get("/campgrounds/:id", function(req, res){
	//find the campgrounds with given id
	Campground.findById(req.params.id).populate("comments likes").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err, foundCampground){
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
router.post("/campgrounds/:id/like", middleWare.isLoggedIn, function(req, res){
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
router.get("/campgrounds/:id/edit", middleWare.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			req.flash("error", "Campground not found");
		}
		else 
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});


//Update Route
router.put("/campgrounds/:id", middleWare.checkCampgroundOwnership, upload.single('image'), function(req, res){
	//find and update the correct campground
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			redirect("/campgrounds");
		}
		else{
			if (req.file) {
					  cloudinary.v2.uploader.destroy(campground.imageId, function(err){
					  if(err){
					  req.flash("error", err.message);
					  return res.redirect("back");
					  }
					  cloudinary.v2.uploader.upload(req.file.path, function(err, result){
					  if(err){
					  req.flash("error", err.message);
					  return res.redirect("back");
					  }
					  campground.image = result.secure_url;
						    campground.imageId = result.public_id;
							campground.name = req.body.campground.name;
							campground.description = req.body.campground.description;
							campground.price = req.body.campground.price;
							campground.save(function(err){
							if(err){
								res.redirect("/campgrounds");
							} else {
								req.flash('success', "Your Campground successfully updated");
								res.redirect("/campgrounds/" + campground._id);
							}
							});
					  });
				  });
            } else {
			campground.name = req.body.campground.name;
			campground.description = req.body.campground.description;
			campground.price = req.body.campground.price;
			campground.save(function(err){
				if(err){
					res.redirect("/campgrounds");
				} else {
					req.flash('success', "Your Campground successfully updated");
					res.redirect("/campgrounds/" + campground._id);
				}
			});
			}
		}
	});
});

router.delete("/campgrounds/:id", middleWare.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err, campground){
		if(err){
			res.redirect("/campgrounds");
		}
		else {
			// deletes all comments associated with the campground
            Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                    //  delete the campground
                    campground.remove();
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/campgrounds");
                });
            });
		}
	});
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;

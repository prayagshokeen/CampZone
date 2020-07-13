var mongoose = require("mongoose");
var Campground = require("./models/campground.js");
var Comment = require("./models/comment");

var data = [
    {
    	name: "Himalaya",
    	image: "https://www.jasons.co.nz/listings/00021870/image_6.jpg?635175965131070000",
    	description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    },
    {
    	name: "Rishikesh",
    	image: "https://www.campingtourist.com/wp-content/uploads/2010/03/camping-ground.jpg",
    	description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    }
]

function seedDb(){
	//Remove all campgrounds
	Campground.remove({}, function(err){
		// if(err){
		// 	console.log(err);
		// }
		//     console.log("campgrounds removed");
		// 	Comment.remove({}, function(err){
		// 		if(err){
		// 			console.log(err);
		// 		}
		// 		console.log("removed comments!!");
		// 		//add a few campgrounds
		// 		data.forEach(function(seed){
		// 			Campground.create(seed, function(err, campground){
		// 				if(err){
		// 					console.log(err);
		// 				}
		// 				else{
		// 					console.log("added a campground!");
		// 					//Create a comment
		// 					Comment.create(
		// 					{
		// 						text: "This is an awesome place, want to go again",
		// 						author: "Prayag"
		// 					}, function(err, comment){
		// 						if(err){
		// 							console.log(err);
		// 						} else{
		// 							campground.comments.push(comment);
		// 							campground.save();

		// 						}
		// 					});
		// 				}
		// 			});
		// 		});
		// 	});
		});

	//add a few comments
}

module.exports = seedDb;

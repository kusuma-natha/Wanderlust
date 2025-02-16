const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError.js");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
        let { id, reviewId } = req.params;
        let listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }
        // Pull the review from the listing and delete it
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted!");
        res.redirect(`/listings/${id}`);
}
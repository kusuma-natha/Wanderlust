const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");
const mongoose = require("mongoose");

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    return res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    return res.render("./listings/new.ejs");
};

module.exports.createListing = async (req, res) => {
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url , filename};
        await newListing.save();
        req.flash("success", "New listing created!!");
        return res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!!");
        return res.redirect("/listings"); 
    }
    res.render("./listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!!");
        return res.redirect("/listings");
    };
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    return res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = { url, filename};
        await updatedListing.save();
    }

    req.flash("success", "Listing Updated!");
    return res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        throw new ExpressError(404, "Listing not found!");
    }
    req.flash("error", "Listing deleted!");
    return res.redirect("/listings");
};
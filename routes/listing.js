const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Index Route
router.get("/", wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    return res.render("./listings/index.ejs", { allListings });
}));

// New Route
router.get("/new", wrapAsync((req, res) => {
    return res.render("./listings/new.ejs");
}));

// Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;

    // Ensure id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }
    return res.render("./listings/show.ejs", { listing });
}));

// Create Route
router.post("/",
    validateListing,
    wrapAsync(async (req, res) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success", "New listing created!!");
        return res.redirect("/listings");
    })
);

// Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;

    // Ensure id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }
    return res.render("./listings/edit.ejs", { listing });
}));

// Update Route
router.put("/:id",
    validateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params;

        // Ensure id is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ExpressError(400, "Invalid listing ID");
        }

        const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        if (!updatedListing) {
            throw new ExpressError(404, "Listing not found!");
        }
        return res.redirect(`/listings/${id}`);
    })
);

// Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;

    // Ensure id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    let deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        throw new ExpressError(404, "Listing not found!");
    }
    req.flash("success", "Listing deleted!");
    return res.redirect("/listings");
}));

module.exports = router;

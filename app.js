const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser());

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // cookie expiration time
        maxAge: 7 * 24 * 60 * 60 * 1000, // maximum age for the cookie
        httpOnly: true, 
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log("Error connecting to DB:", err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
    res.send("Hello, I'm Root");
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// Error handling for unknown routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Global error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    if (!res.headersSent) {
        res.status(statusCode).render("error.ejs", { message });
    } else {
        next(err);
    }
});

app.listen(8080, () => {
    console.log("server is listening to the port 8080");
});

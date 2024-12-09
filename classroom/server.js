const express = require("express");
const cookieParser = require("cookie-parser"); // Import cookie-parser
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
}

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.get("/register", (req,res)=>{
    let {name = "anonymous"} = req.query;
    req.session.name = name;
    if(name === "anonymous"){
        req.flash("error", "user not registered!");
    } else{
        req.flash("success", "user registered succesfully!!");
    };

    res.redirect("/hello");
});

app.get("/hello", (req,res)=>{
    res.render("page.ejs", {name: req.session.name});
});

// app.get("/test2", (req,res)=>{
//     if(req.session.count){
//         req.session.count++;
//     } else{
//         req.session.count = 1;
//     };
//     res.send(`You sent the request ${req.session.count} times`);
// })

app.get("/test", (req,res)=>{
    res.send("test successful");
});

// Use the cookie-parser middleware
// app.use(cookieParser());

// app.get("/getcookies", (req, res) => {
//     // Set a cookie
//     res.cookie("greet", "hello");
//     // Render a response after setting the cookie
//     res.send("Sent some cookies!");
// });

// app.get("/greet", (req,res)=>{
//     let {name = "anonyms"} = req.cookies;
//     res.send(`Hii, ${name}`);
// });

// app.get("/", (req, res) => {
//     // Access the cookies from the request (if available)
//     const greetCookie = req.cookies.greet; // This will retrieve the cookie if it exists
//     res.send(`Hello, hii I am root. Cookie Value: ${greetCookie || 'No cookie set'}`);
// });

app.listen(3000, () => {
    console.log("Server is listening to 3000");
});
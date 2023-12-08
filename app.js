const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const ejs = require("ejs");
const req = require("express/lib/request");
const res = require("express/lib/response");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ritvik",
});
const app = express();
app.set("view engine", "ejs");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Main")));
// http://localhost:3000/
app.get("/", function (request, response) {
  // Render login template
  response.sendFile(path.join(__dirname + "/Main/index.html"));
});

//login as user
// http://localhost:3000/auth
app.post("/auth", function (request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
      // Execute SQL query that'll select the account from the database based on the specified username and password
      connection.query(
        "SELECT * FROM accounts WHERE username = ? AND password = ?",
        [username, password],
        function (error, results, fields) {
          // If there is an issue with the query, output the error
          if (error) throw error;
          // If the account exists
          if (results.length > 0) {
            // Authenticate the user
            request.session.loggedin = true;
            request.session.username = username;
            // Redirect to home page
            // response.redirect("/Main/index2.html");
            response.redirect("/index2");
          } else {
            response.send("Incorrect Username and/or Password!");
          }
          // response.end();
        }
      );
    } else {
      response.send("Please enter Username and Password!");
      response.end();
    }
  });

  //logout user

app.post("/signout", function (request, response) {
    if (request.session.loggedin) {
      // Execute SQL query that'll select the account from the database based on the specified username and password
  
      request.session.loggedin = false;
      // Redirect to home page
      response.redirect("/");
    } else {
      response.send("Cannot logout");
    }
    // response.end();
  });
  
  // http://localhost:3000/home
  app.get("/index", function (request, response) {
    // If the user is loggedin
    if (request.session.loggedin) {
      // Output username
      // response.send("Welcome back, " + request.session.username + "!");
      response.sendFile(path.join(__dirname + "/Main/index.html"));
    } else {
      // Not logged in
      response.send("Please login to view this page!");
    }
    // response.end();
  });

//register user
// router.get("/register", function (req, res, next) {
//   res.render("registration-form");
// });
// to store user input detail on post request
app.post("/auth2", function (req, res, next) {
  inputData = {
    // first_name: req.body.first_name,
    // last_name: req.body.last_name,
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    // gender: req.body.gender,
    // password: req.body.password,
    // confirm_password: req.body.confirm_password,
  };
  inputData2 = {
    // first_name: req.body.first_name,
    // last_name: req.body.last_name,
    username: req.body.username,
    email: req.body.email,
    number: req.body.number,
    address: req.body.address,
    // gender: req.body.gender,
    // password: req.body.password,
    // confirm_password: req.body.confirm_password,
  };
  // check unique email address
  var sql = "SELECT * FROM accounts WHERE email =?";
  connection.query(sql, [inputData.email], function (err, data, fields) {
    console.log(msg);
    if (err) throw err;
    if (data.length > 1) {
      var ans = inputData.email + "was already exist";
      alert(ans);
    }
    // else if (inputData.confirm_password != inputData.password) {
    //   var msg = "Password & Confirm Password is not Matched";
    // }
    else {
      // save users data into database
      var sql = "INSERT INTO accounts SET ?";
      connection.query(sql, inputData, function (err, data) {
        if (err) throw err;
      });
      var sql1 = "INSERT INTO user_profiles SET ?";
      connection.query(sql1, inputData2, function (err, data) {
        if (err) throw err;
      });

      var msg = "Your are successfully registered";
    }
    console.log(msg);
    res.redirect("/userlogin");
  });
});


app.post("/info", function (req, res, next) {
  inputData = {
    btitle: req.body.btitle,
    aname: req.body.aname,
    topic: req.body.topic,

    tarea: req.body.tarea,
    coverp: req.body.coverp,
  };
      var sql = "INSERT INTO blog SET ?";
      connection.query(sql, inputData, function (err, data) {
        if (err) throw err;
      });
      var msg = "Submitted blog successfully";
      console.log(msg);
  });
app.get("/userprofile", function (req, res, next) {
  if (req.session.loggedin) {
    var sql = `SELECT * FROM user_profiles WHERE username="${req.session.username}"`;
    connection.query(sql, function (err, data, fields) {
      if (err) throw err;
      res.render("userprofile", { title: "User List", userData: data });
    });
  } else {
    res.send("Please login to view this page!");
  }
});
//routes
app.get("/userprofile", function (request, response) {
  if (request.session.loggedin) {
    // Render login template
    response.render("userprofile");
  } else {
    response.send("Please login to view this page!");
  }
});
app.get("/userinfo", function (request, response) {
  // Render login template
  response.send({
    username: request.session.username,
  });
});

app.listen(3000);

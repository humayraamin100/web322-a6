
/*************************************************************************
* WEB322– Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Humayra Amin Student ID: 123088213 Date:11 DECEMBER 2022 
*
* Your app’s URL (from Cyclic) : https://wild-toad-handbag.cyclic.app
*
*************************************************************************/ 


var fs = require("fs");
const exp_hbs = require("express-handlebars");
var express = require("express");
const { appendFile } = require("fs");
var multer = require("multer");
var path = require("path");
var server = express();
var data_service = require("./data-service");
var auth = require("./data-service-auth");
const { rejects } = require("assert");
const clientSessions = require("client-sessions");

server.use(clientSessions({
  cookieName: "session", 
  secret: "something",
  duration: 5 * 60 * 1000,
  activeDuration: 2 * 60 * 1000 
}));


function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

server.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
  });


server.engine(
  ".hbs",
  exp_hbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == server.locals.activeRoute ? ' class="active" ' : "") +
          '><a href=" ' +
          url +
          ' ">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equals: function (lvalue, rvalue, options) {
        if (arguments.length < 3) {
          throw new Error("Handlebars Helper equal needs 2 parameters");
        }
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);
server.set("view engine", ".hbs");

var HTTP_PORT = process.env.PORT || 8080;

function onHTTPRequest() {
  console.log("Express http server listening on " + HTTP_PORT);
}

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
const storage = multer.diskStorage({
  destination: "./public/images/uploaded/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

server.use(express.static("public"));

server.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  server.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

server.get("/", (req, res) => {
  res.status(200).render("home");
});

server.get("/images",ensureLogin ,(req, res) => {
  fs.readdir("./public/images/uploaded", (err, items) => {
    if (err) {
      res.status(404);
    } else {
      let arr = [{}];
      for (let i = 0; i < items.length; ++i) {
        arr[i] = { name: items[i] };
      }

      res.render("images", { data: arr });
    }
  });
});

server.post("/employees/add",ensureLogin , (req, res) => {
  data_service
    .addEmployee(req.body)
    .then(() => {
      res.status(200).redirect("/employees");
    })
    .catch((err) => {
      console.log(err);
    });
});

server.get("/about", (req, res) => {
  res.status(200).render("about");
});

server.get("/employees", ensureLogin ,(req, res) => {
  data_service
    .getAllEmployees()
    .then((data) => {
      if (req.query.status) {
        data_service
          .getEmployeeByStatus(req.query.status)
          .then((data) => {
            if (data.length > 0) {
              res.status(200).render("employees", { employees: data });
            } else {
              res.render("employees", { message: "no results" });
            }
          })
          .catch((err) => {
            res.render("employees", { message: "no results" });
          });
      } else if (req.query.department) {
        data_service
          .getEmployeeByDepartment(req.query.department)
          .then((data) => {
            if (data.length > 0) {
              res.status(200).render("employees", { employees: data });
            } else {
              res.render("employees", { message: "no results" });
            }
          })
          .catch((err) => {
            res.render("employees", { message: "no results" });
          });
      } else if (req.query.manager) {
        data_service
          .getEmployeesByManager(req.query.manager)
          .then((data) => {
            if (data.length > 0) {
              res.status(200).render("employees", { employees: data });
            } else {
              res.render("employees", { message: "no results" });
            }
          })
          .catch((err) => {
            res.render("employees", { message: "no results" });
          });
      } else {
        if (data.length > 0)
          res.status(200).render("employees", { employees: data });
        else res.render("employees", { message: "no results" });
      }
    })
    .catch((err) => {
      res.status(404).render({ message: "no results" });
    });
});

server.post("/employee/update", ensureLogin ,(req, res) => {
  data_service
    .updateEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.status(404).send("Error 404");
    });
});

server.get("/managers", ensureLogin ,(req, res) => {
  data_service
    .getManagers()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});

server.get("/employee/:empNum", ensureLogin ,(req, res) => {
  let viewData = {};
  data_service
    .getEmployeeByNum(req.params.empNum)
    .then((data) => {
      if (data) {
        viewData.employee = data; 
      } else {
        viewData.employee = null; 
      }
    })
    .catch(() => {
      viewData.employee = null; 
    })
    .then(data_service.getDepartments)
    .catch((err) => {
      res.status(500).send(err);
    })
    .then((data) => {
      viewData.departments = data; 
      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = []; 
    })
    .then(() => {
      if (viewData.employee == null) {
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { employee: viewData }); 
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

server.get("/employees/add", ensureLogin ,(req, res) => {
  data_service
    .getDepartments()
    .then((data) => {
      if (data) {
        res.status(200).render("addEmployee", { departments: data });
      } else {
        res.status(404).send(err);
      }
    })
    .catch((err) => {
      res.status(200).render("addEmployee", { departments: [] });
    });
});

server.get("/images/add", ensureLogin ,(req, res) => {
  res.status(200).render("addImage");
});

server.get("/employees/delete/:empNum", ensureLogin ,(req, res) => {
  if (req.params.empNum) {
    data_service
      .deleteEmployeeByNum(req.params.empNum)
      .then(() => {
        res.status(200).redirect("/employees");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  } else {
    res.status(500).send("Unable to remove Employee");
  }
});

server.get("/login", (req, res)=>
{
  res.render("login");
})


server.post("/login", (req, res)=>
{
  req.body.userAgent = req.get('User-Agent');

  auth.checkUser(req.body).then((user)=>
  {
    req.session.user = {
      userName: user.userName,
      email: user.email, 
      loginHistory: user.loginHistory
      }
      res.redirect('/employees');
  }).catch((err)=>
  {
    res.render("login", {errorMessage: err, userName: req.body.userName})
  })
})

server.get("/userHistory",ensureLogin ,(req, res)=>
{
  res.render("userHistory");
})

server.get("/logout", (req, res)=>
{
  req.session.reset();
  res.redirect("/");
})

server.get("/register", (req, res)=>
{
  res.render("register");
})

server.post("/register", (req, res)=>
{
  auth.registerUser(req.body).then(()=>
  {
    res.render("register", {successMessage: "User created"});
  }).catch((err)=>
  {
    res.render("register", {errorMessage: err, userName: req.body.userName});
  })
})

server.get("/departments", ensureLogin ,(req, res) => {
  data_service
    .getDepartments()
    .then((data) => {
      if (data.length > 0)
        res.status(200).render("departments", { departments: data });
      else res.render("departments", { message: "no results" });
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});

server.get("/departments/add", ensureLogin ,(req, res) => {
  res.status(200).render("addDepartment");
});

server.post("/departments/add", ensureLogin ,(req, res) => {
  data_service
    .addDepartment(req.body)
    .then(() => {
      res.status(200).redirect("/departments");
    })
    .catch((err) => {
      res.status(404).send("Unable to add department");
    });
});

server.post("/departments/update", ensureLogin ,(req, res) => {
  data_service
    .updateDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.status(404).send("Error 404");
    });
});

server.get("/department/:departmentId", ensureLogin ,(req, res) => {
  if (req.params.departmentId) {
    data_service
      .getDepartmentById(req.params.departmentId)
      .then((deps) => {
        res.render("department", { department: deps });
      })
      .catch((err) => {
        res
          .status(404)
          .render("department", { message: "Department not found" });
      });
  } else {
    res.status(500).send(err);
  }
});

server.get("*", (req, res) => {
  res.status(404).send("Page not available!");
});

server.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.status(200).redirect("/images");
});

auth.initialize()
.then(()=>
{
  data_service
  .initialize()
  .then((msg) => {
    server.listen(HTTP_PORT, onHTTPRequest);
  })
  .catch((msg) => {
    console.log(msg);
  });
}).catch((err)=>
{
  console.log(err);
})

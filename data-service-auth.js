var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcrypt");


var Employees = new Schema({
  userName: {type: String, unique: true},
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});


let User = mongoose.model("users", Employees);


module.exports.initialize = () => {
  return new Promise((res, rej) => {
    let pass1 = encodeURIComponent("12490");
    let db1 = mongoose.createConnection(
        `mongodb+srv://dbUser:${pass1}@senecaweb.qepoyrc.mongodb.net/web322_a6`

    );

    db1.on("error", (err) => {
      console.log("db1 error!");
      rej(err);
    });

    db1.once("open", () => {
      User = db1.model("users", Employees); 
      res();
    });
  });
};


module.exports.registerUser = (userData) => {
  return new Promise((res, rej) => {
    if (
      userData.password.trim().length === 0 ||
      userData.password2.trim().length === 0
    ) {
      rej("Error: user name cannot be empty or only white spaces!");
    } else if (userData.password.trim() != userData.password2.trim()) {
      rej("Error: Passwords do not match");
    } else {
      let newUser = new User(userData);
      bcrypt
        .hash(newUser.password, 10)
        .then((hash) => {
          newUser.password = hash;

          newUser
            .save()
            .then(() => {
              res();
            })
            .catch((err) => {
              if (err.code == 1100) {
                rej("User Name already taken");
              } else {
                rej("There was an error creating the user: " + err);
              }
            });
        })
        .catch((err) => {
          rej("There was an error encrypting the password");
        });
    }
  });
};


module.exports.checkUser = (userData) => {
  return new Promise((res, rej) => {
    User.findOne({ userName: userData.userName })
      .exec()
      .then((result) => {
        if (result) {
          bcrypt
            .compare(userData.password, result.password)
            .then((evaluation_result) => {
              if (!evaluation_result) {
                rej("Wrong password for user: " + userData.userName);
              } else {
                result.loginHistory.push({
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent,
                });

                User.updateOne(
                  { userName: result.userName },
                  { $set: { loginHistory: result.loginHistory } }
                )
                  .exec()
                  .then((updatedValue) => {
                    if (updatedValue) {
                      res(result);               
                    }
                  })
                  .catch((err) => {
                    rej(err);
                  });
              }
            });
        } else {
          rej("Unable to find user: " + userData.userName);
        }
      });
  });
};
const e = require("express");
var fs = require("fs");
const { resolve } = require("path");
const Sequelize = require("sequelize");

var sequelize = new Sequelize(
  "xlzlkmtc",
  "xlzlkmtc",
  "2VoLhvKVY0g5somsIe6KjYXdMEZATq5p",
  {
    host: "heffalump.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: true,
    },
    query: { raw: true }, 
  }
);

var Employee = sequelize.define("Employee", {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  maritalStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  department: Sequelize.INTEGER,
  hireDate: Sequelize.STRING,
});

var Department = sequelize.define("Department", {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  departmentName: Sequelize.STRING,
});

module.exports.getAllEmployees = function () {
  return new Promise((res, rej) => {
    Employee.findAll().then((data) => {
      if (data) {
        res(data);
      } else {
        rej("No results returned");
      }
    });
  });
};


module.exports.getManagers = function () {
  return new Promise((res, rej) => {
    sequelize.sync().then(() => {
      Employee.findAll({ where: { isManager: true } }).then((data) => {
        if (data) {
          res(data);
        } else {
          rej("No results returned");
        }
      });
    });
  });
};



module.exports.getDepartments = function () {
  return new Promise((res, rej) => {
    Department.findAll().then((data) => {
      if (data) {
        res(data);
      } else {
        rej("No results returned");
      }
    });
  });
};


module.exports.initialize = function () {
  return new Promise((res, rej) => {
    sequelize
      .sync()
      .then(() => {
        res();
      })
      .catch((err) => {
        rej("Error initializing");
      });
  });
};


module.exports.addEmployee = (employeeData) => {
  return new Promise((res, rej) => {
    if (employeeData) {
      employeeData.isManager = employeeData.isManager ? true : false;

      for (const attr in employeeData) {
        if (employeeData[attr] == "") {
          employeeData[attr] = null;
        }
      }

      sequelize.sync().then(() => {
        Employee.create(employeeData)
          .then(() => {
            res("success!");
          })
          .catch((err) => {
            rej("Something went wrong" + err);
          });
      });
    } else {
      rej("Unable to create employee");
    }
  });
};


module.exports.getEmployeeByStatus = (emp_status) => {
  return new Promise((res, rej) => {
    sequelize.sync().then(() => {
      Employee.findAll({ where: { status: emp_status } })
        .then((data) => {
          if (data.length == 0) {
            rej("no match found of status given.");
          } else {
            res(data);
          }
        })
        .catch((err) => {
          rej("No results returned");
        });
    });
  });
};


module.exports.getEmployeeByDepartment = (department) => {
  return new Promise((res, rej) => {
    sequelize.sync().then(()=>
    {
      Employee.findAll({where:{department: department}}).then((data)=>
      {
        if(data)
        {
          res(data);
        }
        else
        {
          rej(data);
        }
      })
    })
  });
};


module.exports.getEmployeesByManager = (manager) => {
  return new Promise((res, rej) => {
    sequelize.sync().then(()=>
    {
      Employee.findAll({where:{employeeManagerNum: manager}}).then((data)=>
      {
        if(data)
        {
          res(data);
        }
        else
        {
          rej("No results returned");
        }
      })
    })
  });
};

module.exports.updateEmployee = (employeeData) => {
  return new Promise((res, rej) => {
    if (employeeData) {
      employeeData.isManager = employeeData.isManager ? true : false;

      for (const attr in employeeData) {
        if (employeeData[attr] == "") {
          employeeData[attr] = null;
        }
      }
      sequelize.sync().then(() => {
        Employee.update(employeeData, {
          where: { employeeNum: employeeData.employeeNum },
        })

          .then(() => {
            res("success!");
          })
          .catch((err) => {
            rej("Something went wrong" + err);
          });
      });
    } else {
      rej("Unable to update employee");
    }
  });
};


module.exports.getEmployeeByNum = (num) => {
  return new Promise((res, rej) => {
    sequelize.sync().then(()=>
    {
      Employee.findAll({where:{employeeNum: num}}).then((data)=>
      {
        if(data)
        {
          res(data[0]);
        }
        else
        {
          rej("No results returned");
        }
      })
    })
  });
};


module.exports.addDepartment = (departmentData) => {
  return new Promise((res, rej) => {
    if (departmentData) {
      for (const attr in departmentData) {
        if (departmentData[attr] == "") {
          departmentData[attr] = null;
        }
      }
      sequelize.sync().then(() => {
        Department.create(departmentData)
          .then(() => {
            res("success!");
          })
          .catch((err) => {
            rej("Something went wrong" + err);
          });
      });
    } else {
      rej("Unable to create department");
    }
  });
};

module.exports.updateDepartment = (departmentData) => {
  return new Promise((res, rej) => {
    if (departmentData) {
      for (const attr in departmentData) {
        if (departmentData[attr] == "") {
          departmentData[attr] = null;
        }
      }
      sequelize.sync().then(() => {
        Department.update(departmentData, {
          where: { departmentId: departmentData.departmentId },
        })

          .then(() => {
            res("success!");
          })
          .catch((err) => {
            rej("Something went wrong" + err);
          });
      });
    } else {
      rej("Unable to update department");
    }
  });
};

module.exports.getDepartmentById = (id) => {
  return new Promise((res, rej) => {
    sequelize.sync().then(()=>
    {
      Department.findAll({where:{departmentId: id}}).then((data)=>
      {
        if(data)
        {
          res(data[0]);
        }
        else
        {
          rej("No results returned");
        }
      })
    })
  });
};

module.exports.deleteEmployeeByNum = (empNum) => {
  return new Promise((res, rej) => {
    sequelize.sync().then(() => {
      Employee.destroy({ where: { employeeNum: empNum } })
        .then(() => {
          res();
        })
        .catch((err) => {
          rej(err);
        });
    });
  });
};

sequelize
  .authenticate()
  .then(() => console.log("Connection success."))
  .catch((err) => console.log("Unable to connect to DB.", err));
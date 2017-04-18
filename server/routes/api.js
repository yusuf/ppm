const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');
const Gridfs = require('gridfs-stream');

const jwt = require('express-jwt');

const mongoose = require('mongoose');
var mongoDriver = mongoose.mongo;
var db = mongoose.connection;

// TODO: allow for multiple file uploads
var upload = multer({ dest: 'tmp/'}).single('file');

/*var authCheck = jwt({
  secret: new Buffer('auth0secret'),
  audience: '1QKH2NdD18m2ddQ5kXCzDuJeYTdQk1eA'
});*/

// we'll authenticate users from here
router.use((req, res, next) => {
  //console.log(authCheck);
  if (req.isAuthenticated()) {
    console.log(req.user.mail + " logged in and is using the api");
    next();
  } else {
    console.log("You're not logged in yet.");
  }
});

/* GET api listing. */
router.get('/', (req, res) => {
  res.status(200).json('Successfully connected to API');
});

var Company = require('../models/company.ts');
var Course = require('../models/course.ts');
var Employee = require('../models/employee.ts');
var Ext_examiner = require('../models/ext_examiner.ts');
var Project = require('../models/project.ts');
var Student = require('../models/student.ts');
var File = require('../models/file.ts');

router.route('/projects/unreviewed')
  .get((req, res) => {
    if (req.user.eduPersonAffiliation.includes('employee')) {
      Project.find({ status : 'pending' }, (err, projects) => {
        if (err) {
          return res.status(500).send(err);
        } else {
          return res.status(200).json(projects);
        }
      })
      .populate('course')
      .populate('proposer.user')
      .populate('responsible.user')
      .populate('advisor.user')
      .populate('examiner.user')
      .populate('student');
    } else {
      return res.send("You're not authorized to access this.");
    }
  });

router.route('/projects/:_id/submission')
  // Reads the file from database and creates a stream the client can use
  .get((req, res) => {
    var gfs = new Gridfs(db.db, mongoDriver);
    Project.findOne({ _id : req.params._id }, (err, project) => {
      if (err) {
        return res.status(500).send(err);
      } else {
        if (project.submission) {
          File.findOne({ _id : project.submission }, (err, file) => {
            console.log(file);
            if (err) {
              return res.send(err);
            } else {
              var readStream = gfs.createReadStream(file);
              console.log(readStream);
              readStream.pipe(res);
            }
          });
        }
      }
    });
  })
  .post((req, res) => {
    var gfs = new Gridfs(db.db, mongoDriver);
    Project.findOne({ _id : req.params._id }, (err, project) => {
      /* multer's upload uploads a file to a tmp folder on disk, we use
        gridfs-stream and fs to read the file here and write it to the database,
        we then delete the file from the tmp folder
      */
      upload(req, res, (err) => {
        var writeStream = gfs.createWriteStream({
          filename: req.file.originalname
        });

        var readStream = fs.createReadStream('tmp/' + req.file.filename)
        // Deletes file from client tmp folder
          .on("end", () => {
            fs.unlink("tmp/" + req.file.filename, (err) => {
              res.status(200).json(readStream.id);
            })
          })
          .on("err", () => {
            res.send("error uploading file");
          })
          // reads the input as it writes the output
          .pipe(writeStream);
          // saves the id reference of child file to parent project
          project.submission = readStream.id;
          project.save();
      });
    });
  });

router.route('/company')
  // get all companies
  .get((req, res) => {
    Company
    .find((err, companies) => {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).json(companies);
    })
  })

  // create new company
  .post((req, res) => {
    var obj = req.body;
    var company = new Company(obj);
    company.save((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
      res.status(200).json({ message: 'Your company has been created.'});
      }
    });
  });



router.route('/course')
  // get all courses
  .get((req, res) => {
    Course
    .find((err, courses) => {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).json(courses);
    })
  });

router.route('/employee')

  // get all employees

  .get((req, res) => {
    Employee
    .find((err, employees) => {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).json(employees);
    })
  })

  // create new employee
  .post((req, res) => {
    var obj = req.body;
    var employee = new Employee(obj);
    employee.save((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
      res.status(200).json({ message: 'Your employee has been created.'});
      }
    });
  });



  router.route('/employee/:name')
  // get a employee by name
  .get((req, res) => {
    Employee.findOne({ name : req.params.name }, (err, employee) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(employee);
      }
    })
  });



router.route('/ext_examiner')

  // get all ext_examiners
  .get((req, res) => {
    Ext_examiner
    .find((err, ext_examiners) => {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).json(ext_examiners);
    })
  })

  // create new ext_examiner
  .post((req, res) => {
    var obj = req.body;
    var ext_examiner = new Ext_examiner(obj);
    console.log(ext_examiner);
    ext_examiner.save((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
      res.status(200).json({ message: 'Your ext_examiner has been created.'});
      }
    });
  });


// returns a students project
router.route('/my_project')
  .get((req, res) => {
    if(req.user.eduPersonAffiliation.includes('student')) {
      // finds student based on his mail, so we can retrieve his id
      Student.findOne({ mail: req.user.mail }, (err, student) => {
        if(err) {
          return res.status(500).send(err);
        } else {
          Project
          // finds all the projects that are approved or projects related to the student by email
          .find({ student: student._id }, (err, projects) => {
            if (err) {
              return res.status(500).send(err);
            }
            return res.status(200).json(projects);
          })
          .populate('course')
          .populate('proposer.user')
          .populate('responsible.user')
          .populate('advisor.user')
          .populate('examiner.user')
          .populate('student')
        }
      });
    } else {
      return res.send("You're not authorized to access this.");
    }
  });

router.route('/projects')

  // get all projects
  .get((req, res) => {
    if(req.user.eduPersonAffiliation.includes('student')) {
      // finds student based on his mail, so we can retrieve his id
      Student.findOne({ mail: req.user.mail }, (err, student) => {
        if(err) {
          return res.status(500).send(err);
        } else {
          Project
          // finds all the projects that are approved or projects related to the student by email
          .find({$or:[{ status: 'approved' }, { student: student._id }]}, (err, projects) => {
            if (err) {
              return res.status(500).send(err);
            }
            return res.status(200).json(projects);
          })
          .populate('course')
          .populate('proposer.user')
          .populate('responsible.user')
          .populate('advisor.user')
          .populate('examiner.user')
          .populate('student')
        }
      });

    }
    // return all projects if the user is an employee
    else if(req.user.eduPersonAffiliation.includes('employee')) {
      Project
      .find((err, projects) => {
        if (err) {
          res.status(500).send(err);
        }
        res.status(200).json(projects);
      })
      .populate('course')
      .populate('proposer.user')
      .populate('responsible.user')
      .populate('advisor.user')
      .populate('examiner.user')
      .populate('student')
    } else {
      return res.send("Could not verify your affiliation.");
    }

  })

  // create new project
  .post((req, res) => {
    var obj = req.body;
    var project = new Project(obj);

    if(req.user.eduPersonAffiliation.includes('employee')) {
      project.status = 'approved';
      project.save((err) => {
        if (err) {
          res.status(500).send(err);
        } else {
        res.status(200).json({ message: 'Your project has been created.'});
        }
      });
    } else {
      project.status = 'pending';
      project.save((err) => {
        if (err) {
          res.status(500).send(err);
        } else {
        res.status(200).json({ message: 'Your project has been created.'});
        }
      });
    }

  });

router.route('/projects/:_id')

  // get a project by id
  .get((req, res) => {
    Project.findOne({ _id : req.params._id }, (err, project) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(project);
      }
    })
  .populate('course')
  .populate('proposer.user')
  .populate('responsible.user')
  .populate('advisor.user')
  .populate('examiner.user')
  .populate('student')
  })

  // update a project by id
  .put((req, res) => {
    var obj = req.body;
    var project = new Project(obj);

    Project.findOneAndUpdate({ _id : project._id }, project,
        (err) =>{
      if (err) {
        res.status(500).send(err);
      } else {
      res.status(200).json({ message: 'Your project has been updated.'});
      }
    });
  })

  // delete a project by id
  .delete((req, res) => {
    var obj = req.body;
    var project = new Project(obj);

    Project.findOneAndRemove({ _id : project._id }, project, (err) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json({ message: 'Your project has been deleted.'});
      }
    });
  });



router.route('/student')

  // get all students
  .get((req, res) => {
    Proposer
    .find((err, proposers) => {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).json(proposers);
    })
  })

  // create new student
  .post((req, res) => {
    var obj = req.body;
    var student = new Student(obj);
    console.log(student);
    student.save((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
      res.status(200).json({ message: 'Your student has been created.'});
      }
    });
  });



router.route('/student/:name')
  // get a student by name
  .get((req, res) => {
    Student.findOne({ name : req.params.name }, (err, student) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(student);
      }
    })
  });



module.exports = router;

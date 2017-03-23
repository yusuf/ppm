const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

// we'll authenticate users from here
router.use((req, res, next) => {
  console.log('A request has been made.');
  next();
});

/* GET api listing. */
router.get('/', (req, res) => {
  res.status(200).json('Successfully connected to API');
});

var Project = require('../models/project.ts');
var Course = require('../models/course.ts');
var Employee = require('../models/employee.ts');
var Student = require('../models/student.ts');


router.route('/projects')
  // get all projects
  .get((req, res) => {
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
  })

  // create new project
  .post((req, res) => {
    var obj = req.body;
    var project = new Project(obj);
    console.log(project);
    project.save((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
      res.status(200).json({ message: 'Your project has been created.'});
      }
    });
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

router.route('/advisor')
  // get all advisors
  .get((req, res) => {
    Advisor
    .find((err, advisors) => {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).json(advisors);
    })
  })

  // create new advisor
  .post((req, res) => {
    var obj = req.body;
    var advisor = new Advisor(obj);
    console.log(advisor);
    advisor.save((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
      res.status(200).json({ message: 'Your advisor has been created.'});
      }
    });
  });


  router.route('/examiner')
  // get all examiners
  .get((req, res) => {
    Examiner
    .find((err, examiners) => {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).json(examiners);
    })
  })

  // create new examiner
  .post((req, res) => {
    var obj = req.body;
    var examiner = new Examiner(obj);
    console.log(examiner);
    examiner.save((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
      res.status(200).json({ message: 'Your examiner has been created.'});
      }
    });
  });


  router.route('/proposer')
  // get all proposers
  .get((req, res) => {
    Proposer
    .find((err, proposers) => {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).json(proposers);
    })
  })

  // create new proposer
  .post((req, res) => {
    var obj = req.body;
    var proposer = new Proposer(obj);
    console.log(proposer);
    proposer.save((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
      res.status(200).json({ message: 'Your proposer has been created.'});
      }
    });
  });


    router.route('/responsible')
  // get all responsibles
  .get((req, res) => {
    Responsible
    .find((err, responsibles) => {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).json(responsibles);
    })
  })

  // create new responsible
  .post((req, res) => {
    var obj = req.body;
    var responsible = new Responsible(obj);
    console.log(responsible);
    responsible.save((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
      res.status(200).json({ message: 'Your responsible has been created.'});
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

  // create new proposer
  .post((req, res) => {
    var obj = req.body;
    var proposer = new Proposer(obj);
    console.log(proposer);
    proposer.save((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
      res.status(200).json({ message: 'Your proposer has been created.'});
      }
    });
  });

module.exports = router;
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/main.js');
const mongoose = require('mongoose');
const Project = require('./models/project');
const User = require('./models/user');
const functions = require('../config/functions.js')
const urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function(app, passport) {
//HOME ROUTE
  app.route('/')
    .get(function(req, res) {
      if (!req.user) {
        res.render('login.ejs');
      } else {
        res.redirect('/projects')
      };
    })
    .post(urlencodedParser, function(req, res, next) {
      passport.authenticate('local', function (err, user, info) {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.redirect('/')
        }

        req.logIn(user, function(err) {
          if (err) {
            return next(err)
          }

          res.redirect('/projects')
        })
      })(req, res, next)
    })

//PROJECTS ROUTE
  app.route('/projects')
    .get(isLoggedIn, function(req, res) {

      Project.find()
      .where('archived', false)
      .exec(function (err, projects) {
        if (err) {
          console.log(err);
        }

        res.render('index.ejs', {
          title: "All Projects",
          projects: projects,
          projects_page: true,
          functions: functions,
          user: req.user
        })
      })
    })
    .post(urlencodedParser, function(req, res) {
      Project.find(function(err, projects) {
        if (err) {
          console.log(err);
        }

        var project = new Project();

        //auto-gen tracking
        project.tracking = functions.autoGenerateTracking(projects.length, projects);

        //customer info
        project.customer_info.name = req.body.customer_name;
        project.customer_info.address_1 = req.body.customer_address_1;
        project.customer_info.address_2 = req.body.customer_address_2;
        project.customer_info.address_city = req.body.customer_address_city;
        project.customer_info.address_state = req.body.customer_address_state;
        project.customer_info.address_zip = req.body.customer_address_zip;

        project.job_name = req.body.job_name;
        project.instructions = req.body.instructions;
        project.due_date = req.body.due_date;
        project.delivery = req.body.delivery;
        project.archived = false;

        project.save(function(err) {
          if (err) {
            console.log(err);
          }

          console.log('saved project to database');
          res.redirect('/projects');
        })
      })
    })

//RE-RENDER PROJECTS PARTIAL
  app.route('/filter')
    .get(function(req, res) {
      console.log(typeof req.query.archived);
      Project.find()
      .where('archived', req.query.archived)
      .exec(function (err, projects) {
        if (err) {
          console.log(err);
        }

        res.render('partials/projects.ejs', {
          functions: functions,
          projects: projects
        })
      })
    })

  app.route('/all')
    .get(function(req, res) {
      Project.find(function(err, projects) {
        if (err) res.send(err)

        res.render('partials/projects.ejs', {
          functions: functions,
          projects: projects
        })

      })
    })

//SEARCH ROUTE
  app.route('/search')
    .get(function(req, res) {
      Project.find({
        $or: [
          {
            "customer_info.name": req.query.search
          },{
            "job_name": req.query.search
          }
        ]
      },
      function(err, projects) {
        if (err) {
          console.log(err);
        }

        res.render('partials/projects.ejs', {
          functions: functions,
          projects: projects
        })
      })
    })

//SORT PROJECTS ROUTES
  // app.sort

//USER PROFILE ROUTE
  app.route('/user/:username')
    .get(isLoggedIn, function(req, res) {
      if (req.user.username === req.params.username || req.user.role == "Admin") {
        User.findOne({_id: req.session.userID}, (err, result) => {
          res.render('profile.ejs', {
            title: req.user.username + "'s Profile",
            projects_page: false,
            user: req.user
          })
        })
      } else {
        res.redirect('/projects');
      }
    })
    .post(urlencodedParser, function(req, res) {
      var password = functions.confirmPasswords(req.password, req.password_conf);
      var userObj = {};
      if (req.body.username) {
        userObj.username = req.body.username
      }
      if (req.body.password) {
        userObj.password = req.body.password;
      }

      User.findOneAndUpdate(
        {
          _id: req.session.userID
        },
        {
          $set: {
            userObj
          }
        },
        function(err, result) {
          res.redirect('/projects')
        }
      )
    })

//LOGOUT
  app.route('/logout')
    .get(function(req, res) {
      req.logout();
      res.redirect('/');
    })

//PROJECT EDIT ROUTE
  app.route('/projects/edit/:tracking')
    .get(isLoggedIn, (req, res) => {
      Project.findOne({tracking: req.params.tracking}, (err, result) => {
        if (err) return console.log(err);

        User.find(function(err, users) {
          if (err) throw err;

          res.render('edit.ejs', {
            title: result.job_name + " Edit Page",
            functions: functions,
            users: users,
            project: result,
            projects_page: false,
            user: req.user
          })
        })
      })
    })
    .post(urlencodedParser, (req, res) => {
      Project.findOneAndUpdate(
        {
          'tracking': req.params.tracking
        },
        { $set:
          {
            // customer info
            'customer_info.name': req.body.customer_name,
            'customer_info.address_1': req.body.customer_address_1,
            'customer_info.address_2': req.body.customer_address_2,
            'customer_info.address_city': req.body.customer_address_city,
            'customer_info.address_state': req.body.customer_address_state,
            'customer_info.address_zip': req.body.customer_address_zip,

            job_name: req.body.job_name,
            instructions: req.body.instructions,

            due_date: req.body.due_date,
            delivery: req.body.delivery,
            archived: req.body.archive
          },
          $push: {
            details: {
              progress: req.body.progress,
              worker: req.body.worker,
              hours: req.body.hours
            },
            notes: req.body.notes
          }
        },
        {upsert: true},
        function(err, project) {
          if (err) throw err;

          res.redirect('/projects')
        }
      )
    })

//DELETE PROJECT ROUTE
  app.route('/projects/delete/:tracking')
    .post(function(req, res) {
      Project.remove({
        tracking: req.params.tracking
      }, function (err, project) {
        if (err) throw err;

        res.redirect('/projects')
      })
    })

//ALL USERS ROUTE
  app.route('/users')
    .get(isLoggedIn, function(req, res) {
      User.find(function(err, users) {
        if (err) throw err;

        res.render('users.ejs', {
          title: "All Users",
          users: users,
          projects_page: false,
          user: req.user
        })
      })
    })
    .post(urlencodedParser, function(req, res) {
      if (!req.body.username) {
        res.json({success: false, message: "Please enter a username"})
      } else if (!req.body.password) {
        res.json({success: false, message: "Please enter a password"})
      } else {
        var newUser = new User({
          name: req.body.name,
          username: req.body.username,
          password: req.body.password
        })

        newUser.save(function(err) {
          if (err) {
            return res.json({success: false, message: err})
          }
          res.redirect('/projects')
        })
      }
    })

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }

    res.redirect('/');
  }
}

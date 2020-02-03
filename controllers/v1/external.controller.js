var express = require('express');
var router = express.Router();


var multer = require('multer');
var bodyParser = require('body-parser');
var path = require('path');

var externalServ = require('../../services/external.service');


// routes
router.post('/mapSolutionsToProgram', mapSolutionsToProgram);
router.post('/mapUsersToSolution', mapUsersToSolution);
router.post('/createImpTemplates',createImpTemplates);
router.post('/mapSchoolsToProjects',mapSchoolsToProjects);
router.post('/check',check);


module.exports = router;



function check(req, res) {
  console.log("req",req);
  res.send(req._readableState);
}

/**
 * multer configuartion for storing uplaod images
 */
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './temp')
  },
  filename: function (req, file, cb) {
    cb(null, (Date.now() + (Math.floor(Math.random() * Math.floor(10)))+"file"+(Math.floor(Math.random() * Math.floor(10))) + path.extname(file.originalname)))
    // cb(null,path.extname(file.originalname))
  }
});

/**
 * image format and size validation
 */
var uploadProjectsTemplate = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.csv') {
      return callback(new Error('Only csv are allowed'))
    }
    callback(null, true)
  },
  limits: {
    fileSize: 1024 * 1024
  }
// }).single('projectsTemplate');
// }).fields([{ name: 'taskDetails', maxCount: 1 }, { name: 'projectsTemplate', maxCount: 1 }]);
}).fields([{ name: 'taskDetails', maxCount: 1 }, { name: 'projectsTemplate', maxCount: 1 }]);

var UploadtaskDetails = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.csv') {
      return callback(new Error('Only csv are allowed'))
    }
    callback(null, true)
  },
  limits: {
    fileSize: 1024 * 1024
  }
}).fields([{ name: 'taskDetails', maxCount: 1 }, { name: 'projectsTemplate', maxCount: 1 }]);


var upload = multer({ storage : storage,fileFilter(req, file, callback) {
  var ext = path.extname(file.originalname);
  if (ext !== '.csv') {
    return callback(new Error('Only csv are allowed'))
  }
  callback(null, true)
}
 }).single('template');







function mapSolutionsToProgram(req, res) {
  externalServ.mapSolutionsToProgram(req.body).then(function (result) {
    res.send(result);
  });
}

function mapUsersToSolution(req,res) {

  upload(req, res, function (err) {
    if (err) {
     
      
      res.send( { status: "failed", error: err.toString()});
      

    } else {
      if (req.file) {
        console.log("file", req.file.filename);
        externalServ.mapUsersToSolution(req, res)
          .then(function (result) {
            res.send(result);
          });

      }

    }

  });
}

function createImpTemplates(req,res){
  // projectServe.taskSync(req)
  // .then(function (result) {
  //     res.send(result);
  // });

  console.log("request");


  var projectDetailsFile = "";
  var taskDetailsFile = "";

  uploadProjectsTemplate(req, res, function (err) {
    if (err) {

      console.log("err",err);
      res.send( { status: "failed", error: err.toString()});
      // res.send({ status: "failed", error: err });
    } else {
      if (req.files) {

        // projectDetailsFile = req.files;
        externalServ.createImpTemplates(req, res)
          .then(function (result) {
            res.send(result);
          });

       
      }

    }
  });
}

function mapSchoolsToProjects(req, res) {


  upload(req, res, function (err) {
    if (err) {
      // console.log(JSON.stringify(err.Error));
      // var js = { status: "failed", error: JSON.stringify(err.Error) }

      res.send( { status: "failed", error: err.toString()});

    } else {
      if (req.file) {
        console.log("file", req.file.filename);

        try{
          externalServ.mapSchoolsToProjects(req, res)
          .then(function (result) {
            res.send(result);
          }).catch(e => console.log("e",e));
       
        }catch(err){
          console.log("errr",err);
          }
        
      }

    }
  });
}
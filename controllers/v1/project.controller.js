var express             = require('express');
var router              = express.Router();
// var _                   = require('underscore');


// var http                = require('http');
// var Q                   = require('q');
// var fs                  = require('fs');
// var mime                = require('mime');
// var path                = require('path');

var winston = require('../../config/winston');
var projectServe = require('../../services/project.service');

// routes
router.post('/create', createProject);
router.get('/all', getAllProjects);
router.post('/project/sync',syncProject);
router.post('/createTask',createTask);
router.post('/createSubTask',createSubTask);
router.post('/syncSubTask',syncSubTask);
router.post('/getMindTreeProjects',getMindTreeProjects);
router.post('/deleteTask',deleteTask);
router.delete('/deleteSubTask',deleteSubTask);
router.post('/taskSync',taskSync);
router.get('/schoolList',schoolList);
router.post('/projectsByEntity',projectsByEntity);
router.post('/projectsDetailsById',projectsDetailsById);
router.get('/getTaskDetailsById/:id',getTaskDetailsById);
router.get('/getSubTaskDetails/:subTaskId/:taskId',getSubTaskDetails);
router.post('/getProjectPdf',getProjectPdf);
module.exports = router;

function createProject(req, res) {

    projectServe.createProject(req,res)
        .then(function (result) {
            res.send(result);
        });
}

function getAllProjects(req, res) {

    projectServe.getAllProjects(req,res)
        .then(function (result) {
            res.send(result);
        });
}

function syncProject(req, res){
    
    projectServe.syncProject(req)
        .then(function (result) {
            res.send(result);
        });

}

function createTask(req,res){
    projectServe.createTask(req)
        .then(function (result) {
            res.send(result);
        });
}
function createSubTask(req,res){
    projectServe.createSubTask(req)
    .then(function (result) {
        res.send(result);
    });
}

function syncSubTask(req,res){

    
    projectServe.syncSubTask(req)
    .then(function (result) {
        res.send(result);
    });
}
function getMindTreeProjects(req,res){
    projectServe.getMindTreeProjects(req)
    .then(function (result) {
        res.send(result);
    });
}
function deleteTask(req,res){
    projectServe.deleteTask(req)
    .then(function (result) {
        res.send(result);
    });
}
function deleteSubTask(req,res){
    projectServe.deleteSubTask(req)
    .then(function (result) {
        res.send(result);
    });
}
function taskSync(req,res){
    projectServe.taskSync(req)
    .then(function (result) {
        res.send(result);
    });
}

function schoolList(req,res){
    projectServe.schoolList(req)
    .then(function (result) {
        res.send(result);
    });
}

function projectsByEntity(req,res){
    projectServe.projectsByEntity(req)
    .then(function(result){
        res.send(result);
    });
}
function projectsDetailsById(req,res){
    projectServe.projectsDetailsById(req)
    .then(function(result){
        res.send(result);
    });
}
function getTaskDetailsById(req,res){

    projectServe.getTaskDetailsById(req)
    .then(function(result){
        res.send(result);
    }).catch(e => {
        console.log("erorr while featching data",e);
        res.send(e);
      });
}
function getSubTaskDetails(req,res){

    projectServe.getSubTaskDetails(req)
    .then(function(result){
        res.send(result);
    }).catch(e => {
        console.log("erorr while featching data",e);
        res.send(e);
      });
}
function getProjectPdf(req,res){

    projectServe.getProjectPdf(req)
    .then(function(result){
        res.send(result);
    }).catch(e => {
        winston.error("erorr while get Project Pdf",e);
        res.send(e);
      });
}








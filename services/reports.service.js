/**
 * @reports.service.js
 *
 * api related functionalities are written below
 */

/**
 * Loading Application level configuration data
 */
var config = require('../config/config.json');
var winston = require('../config/winston');
var userEntities = require('../helpers/user-entities');

var mongoose = require('../node_modules/mongoose');
var moment = require('moment');

var solutionsModel = require('../models/solutions.js');
var projectsModel = require('../models/projects.js');
var taskModel = require('../models/task.js');
var programsModel = require('../models/programs.js');





/**
 * Loading external libraries used
 */
var request = require('request');

var _this = this;
var api = {};
api.getReports = getReports;
api.getObservationReport = getObservationReport;
api.getMonthViseReport = getMonthViseReport;
api.getDetailViewReport = getDetailViewReport;

module.exports = api;

/**
 * 
 * @param {*} getReports api is used to get the reports of all scholl names with observation names 
 */
async function getReports(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await userEntities.userEntities(req);

            // console.log("data --",data);
            if (data.status == "success") {
                let result = JSON.parse(data.data).result;


                // console.log("profileData",data.profileData.result);


                let arrayOfEntity = [];
                await Promise.all(result.map(async ele => {
                    arrayOfEntity.push(ele._id);
                }));
                console.log("arrayOfEntity", arrayOfEntity);


                // arrayOfEntity = ["5c70d7d92da51f754ca01f39", "5cebbefe5943912f56cf8e16", "5c6ce843723d0b1ecde8b2e8"]
                let reqBody = {
                    "entityIds": arrayOfEntity
                }

                if (req.query.search) {
                    reqBody.search = req.query.search;
                    reqBody.entityType = data.profileData.result.roles[0].entities[0].entityType;
                    reqBody.queryId = data.profileData.result.roles[0].entities[0]._id;
                }

                console.log("reqBody", reqBody);

                let url = config.dhiti_config.api_base_url + config.dhiti_config.observationsByEntity;
                request({
                    headers: {
                        'x-auth-token': req.headers['x-auth-token'],
                        'Content-Type': 'application/json',
                    }, url: url, method: 'POST', json: reqBody
                }, async function (error, httpResponse, body) {
                    if (error) {
                        let obj = {
                            status: "failed",
                            // message: "failed during fetching school details ",
                            errorObject: error,
                            message: error.message,
                            stack: error.stack
                        };
                        winston.error(obj);
                        return resolve(obj);
                    }

                    let responseObj = [];
                    // console.log("body.data",body);

                    if (body) {
                        await Promise.all(body.map(function (ele) {

                            // var time = "";
                            // if(ele.event.createdAt){
                            //     time = ele.event.createdAt;
                            // }
                            var obserationInfo = {
                                "observationName": ele.event.observationName,
                                "observationSubmissionId": ele.event.observationSubmissionId,
                                "entityId": ele.event.entityId,
                                "entityName": ele.event.entityName,
                                "date": ele.event.createdAt

                            }
                            responseObj.push(obserationInfo);
                        }));
                        return resolve({
                            status: "success",
                            message: "successfully got obseration By entity",
                            data: responseObj

                        })
                    } else {
                        return resolve({
                            status: "failed",
                            message: body.message,
                            data: "data not found"

                        })
                    }

                });
            } else {

                // console.log("asdasd");
                return resolve({
                    status: "failed",
                    message: "Data not found"
                })
            }
        } catch (error) {
            return reject({
                status: "failed",
                message: error,
                errorObject: error
            });
        }
        finally {
        }
    });
}

/**
 * getObservationReport is used to get the pdf report for instance level
 * it communicate with the dithi service to get the pdf
 * @param {*} req
 */
async function getObservationReport(req) {
    return new Promise(async (resolve, reject) => {
        try {

            let id = req.query.observationId;
            console.log("req", id);



            let url = config.dhiti_config.api_base_url + config.dhiti_config.instanceLevelPdfReports + '?submissionId=' + id;

            console.log("url", url);
            request({
                headers: {
                    'x-auth-token': req.headers['x-auth-token'],
                }, url: url,
            }, async function (error, httpResponse, body) {
                if (error) {
                    let obj = {
                        status: "failed",
                        // message: "failed during fetching school details ",
                        errorObject: error,
                        message: error.message,
                        stack: error.stack
                    };
                    winston.error(obj);
                    return reject(obj);
                };


                return resolve(body)
            });
        } catch (error) {
            return reject({
                status: "failed",
                message: error,
                errorObject: error
            });
        }
        finally {
        }
    });
}


/**
 * getMonthViseReport is used to get the report of last Month or last quarter
 * @param {*} req
 */
async function getMonthViseReport(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let completed = 0;
            let pending = 0;
            let projectsData = await projectsModel.find({
                userId: req.body.userId
            })
            var endOf = "";
            var startFrom = "";
            if (req.query.reportType == "lastQuarter") {
                endOf = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                startFrom = moment().subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
            } else {
                endOf = moment().subtract(0, 'months').endOf('month').format('YYYY-MM-DD');
                startFrom = moment().subtract(0, 'months').startOf('month').format('YYYY-MM-DD');
                let currentDate = moment().format('YYYY-MM-DD');
                if(currentDate!=endOf){
                    endOf = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                    startFrom = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
                }
            }
            console.log(startFrom, "endOf", endOf);
            if (projectsData.length > 0) {
                await Promise.all(
                    projectsData.map(async projectList => {
                        let taskData = await taskModel.find({
                            projectId: projectList._id, $or: [
                                { lastSync: { $gte: startFrom, $lte: endOf } },
                                { "subTasks.lastSync": { $gte: startFrom, $lte: endOf } }
                            ]
                        });
                        let isAllTaskCompleted = true;
                        let isPending = true;
                        if (taskData.length > 0) {
                            await Promise.all(taskData.map(async taskList => {
                                let status = (taskList.status).toLowerCase();
                                if (taskList.subTasks.length > 0) {
                                    await Promise.all(taskList.subTasks.map(async subTasks => {
                                        if (subTasks.status) {
                                            let subtaskStatus = subTasks.status.toLowerCase();
                                            if (subtaskStatus == "completed") {
                                                isAllTaskCompleted = true;
                                                isPending = false;
                                            } else if (subtaskStatus == "not started yet" || subtaskStatus == "not yet started") {
                                                isPending = false;
                                                isAllTaskCompleted = false;
                                            } else {
                                                isPending = true;
                                                isAllTaskCompleted = false;
                                            }
                                        }
                                    }));
                                } else {
                                    if (status == "completed") {
                                        isAllTaskCompleted = true;
                                        isPending = false;
                                    } else if (status == "not started yet" || status == "not yet started") {
                                        isPending = false;
                                        isAllTaskCompleted = false;
                                    } else {
                                        isPending = true;
                                        isAllTaskCompleted = false;
                                    }
                                }
                            }
                            ));
                        } else {
                            isAllTaskCompleted = false;
                            isPending = false;
                        }
                        if (isAllTaskCompleted) {
                            completed = completed + 1;
                        }
                        if (isPending) {
                            pending = pending + 1;
                        }
                    })
                );
                resolve({ status: "success", data: { "pending": pending, "completed": completed, endMonth: moment(endOf).format('MMMM'), startMonth: moment(startFrom).format('MMMM') }, message: "Report Generated Succesfully " });
            } else {
                reject({ status: "failed", "message": "no data found", data: [] })
            }
        } catch (ex) {
            winston.error({ "error":ex,"where":"getMonthViseReport api " } );
            reject({ status: "failed", "message": ex })
        }
    });
}


/**
 * getDetailViewReport is used to return the complete details of lastmonth or quarter data to generate the chart
 * @param {*} req
 */
async function getDetailViewReport(req) {
    return new Promise(async (resolve, reject) => {
        try {
            let projectsData = await projectsModel.find({
                userId: req.body.userId
            })
            let chartObject = [];
            var endOf = "";
            var startFrom = "";
            // console.log("req.query",req.query);

           

            if (req.query.reportType == "lastQuarter") {
                endOf = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                startFrom = moment().subtract(3, 'months').startOf('month').format('YYYY-MM-DD');
            } else {
                endOf = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                startFrom = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
            }

            // console.log(startFrom,"endOf",projectsData.length);
            if (projectsData.length > 0) {
                await Promise.all(
                    projectsData.map(async projectList => {
                        let taskData = await taskModel.find({
                            projectId: projectList._id, $or: [
                                { lastSync: { $gte: startFrom, $lte: endOf } },
                                { "subTasks.lastSync": { $gte: startFrom, $lte: endOf } }
                            ]
                        });
                        let reponseObj = {
                            title: {
                                text: projectList.title
                            },
                            series: [{
                                name: projectList.title,
                                data: []
                            }],
                            xAxis: {

                            }
                        };
                        reponseObj.series[0].data = [];
                        reponseObj.xAxis.min = "";
                        reponseObj.xAxis.max = "";
                        reponseObj.series[0].name = projectList.title;
                        if (taskData.length > 0) {
                            await Promise.all(taskData.map(async taskList => {
                                let status = (taskList.status).toLowerCase();
                                // console.log(taskList.subTasks.length, "status: ", projectList._id," ",status);
                                // if (taskList.subTasks.length > 0) {
                                //     await Promise.all(taskList.subTasks.map(async subTasks => {

                                //         if (subTasks.status) {
                                //             let subtaskStatus = subTasks.status.toLowerCase();
                                //             if (subtaskStatus == "completed" || subtaskStatus!="not started yet") {

                                //                 let obj = {
                                //                     name:taskList.title,
                                //                     id: taskList._id,
                                //                     start: taskList.startDate,
                                //                     end: taskList.endDate
                                //                 }
                                //                 reponseObj.series.data.push(obj);
                                //             }
                                //         }
                                //     }));
                                // } else {
                                // if (status!="not started yet") {

                                if (reponseObj.xAxis.min != "" && reponseObj.xAxis.max != "") {
                                    if (moment(reponseObj.xAxis.min) > moment(taskList.startDate)) {
                                        reponseObj.xAxis.min = taskList.startDate;
                                    }
                                    if (moment(reponseObj.xAxis.max) > moment(taskList.endDate)) { } else {
                                        reponseObj.xAxis.max = taskList.endDate;
                                    }
                                } else {
                                    reponseObj.xAxis.min = taskList.startDate;
                                    reponseObj.xAxis.max = taskList.endDate;
                                }

                                let color = "";
                                if (status == "not yet started" || status == "not started yet") {
                                    color = "#f5f5f5";
                                } else if (status == "completed") {
                                    color = "#20ba8d";
                                } else if (status == "inprogress") {
                                    color = "#ef8c2b";
                                }
                                let obj = {
                                    name: taskList.title,
                                    id: taskList._id,
                                    color: color,
                                    start: moment.utc(taskList.startDate).valueOf(),
                                    end: moment.utc(taskList.endDate).valueOf()
                                }

                                // console.log("obj",obj)
                                reponseObj.xAxis.min = moment.utc(reponseObj.xAxis.min).valueOf('YYYY,mm,DD');
                                reponseObj.xAxis.max = moment.utc(reponseObj.xAxis.max).valueOf('YYYY,mm,DD');
                                // console.log("---",moment.utc(reponseObj.xAxis.min).valueOf());
                                reponseObj.series[0].data.push(obj);
                                // reponseObj.push(taskList);
                                // }
                                // }
                            })
                            )
                            chartObject.push(reponseObj);
                        } else {
                        }
                    })
                )
                resolve({ status: "success", "message": "Chart details generated succesfully", data: chartObject })
            } else {
                reject({ status: "failed", "message": "no data found", data: [] })
            }
        } catch (ex) {
            console.log("ex", ex);
            reject({ status: "failed", "message": "no data found", data: [], error: ex });
        }
    }
    );
}

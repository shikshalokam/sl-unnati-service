/**
 * name : helper.js
 * author : Rakesh
 * created-date : 01-Nov-2020
 * Description : Entity report functionalities
 */

// Dependencies

const userProjectsHelper = require(MODULES_BASE_PATH + "/userProjects/helper");
const dhitiService = require(GENERICS_FILES_PATH + "/services/dhiti");
const moment = require('moment');



/**
    * Report Helper
    * @class
*/

module.exports = class ReportsHelper {

    /**
    * Entity Report.
    * @method
    * @name entity 
    * @param {String} entityId - mapped entity id.
    * @param {String} userId - Logged in user id.
    * @param {String} userToken - Logged in user keyclock token.
    * @param {String} userId - Logged in user name.
    * @param {String} reportType - report type monthly or quterly.
    * @param {String} programId - program id
    * @param {Boolean} getPdf - pdf true or false
    * @returns {Object} Entity report.
   */
    static entity(entityId = "", userId, userToken, userName, reportType, programId = "", getPdf) {
        return new Promise(async (resolve, reject) => {
            try {

                let query = { };
                if (entityId) {
                    query["entityId"] = ObjectId(entityId);
                } else {
                    query["userId"] = userId
                }

                let dateRange = await _getDateRangeofReport(reportType);
                let endOf = dateRange.endOf;
                let startFrom = dateRange.startFrom;


                let pdfReportString = moment(startFrom).format('MMM YY');
                if (reportType == 3) {
                    pdfReportString = pdfReportString + " - " + moment(endOf).format('MMM YY');
                }

                if (programId) {
                    query['programId'] = ObjectId(programId);
                }
                query['isDeleted'] = { $ne: true };

                query['$or'] = [
                    { "syncedAt": { $gte: new Date(startFrom), $lte: new Date(endOf) } },
                    { "tasks": { $elemMatch: { isDeleted: { $ne: true },syncedAt: { $gte: new Date(startFrom), $lte: new Date(endOf) } } } },
                ]

                const projectDetails = await userProjectsHelper.projectDocument(
                    query,
                    ["programId","programInformation.name", "entityInformation.name", "taskReport", "status", "tasks", "categories"],
                    []
                );


                let tasksReport = {
                    "total": 0,
                    "overdue": 0
                };
                tasksReport[CONSTANTS.common.COMPLETED_STATUS] = 0;
                tasksReport[CONSTANTS.common.INPROGRESS_STATUS] = 0;
                tasksReport[CONSTANTS.common.NOT_STARTED_STATUS] = 0;

                let categories = {
                    "total": 0
                };
                
                let projectReport = {
                    "total": 0,
                    "overdue": 0,
                };
                projectReport[CONSTANTS.common.COMPLETED_STATUS] = 0;
                projectReport[CONSTANTS.common.INPROGRESS_STATUS] = 0;
                projectReport[CONSTANTS.common.NOT_STARTED_STATUS] = 0;


                let types = await this.types();
                let returnTypeInfo = types.data.filter(type => {
                    if (type.value == reportType) {
                        return type.label;
                    }
                });

                if (!projectDetails.length > 0) {

                    if (getPdf == true) {

                        let reportTaskData = {};
                        Object.keys(tasksReport).map(taskData => {
                            reportTaskData[UTILS.camelCaseToTitleCase(taskData)] = tasksReport[taskData];
                        });

                        let categoryData = {};
                        Object.keys(categories).map(category => {
                            categoryData[UTILS.camelCaseToTitleCase(category)] = categories[category];
                        });

                        let pdfRequest = {
                            "reportType": returnTypeInfo[0].label,
                            "sharedBy": userName,
                            "reportTitle": pdfReportString,
                            categories: categoryData,
                            tasks: reportTaskData,
                            projects: projectReport,

                        }

                        let response = await dhitiService.entityReport(userToken, pdfRequest);

                        if (response && response.success == true) {

                            return resolve({
                                success: true,
                                message: CONSTANTS.apiResponses.REPORT_GENERATED,
                                data: {
                                    data: {
                                        downloadUrl: response.data.pdfUrl
                                    }
                                }
                            });
                        } else {
                            return resolve({
                                message: CONSTANTS.apiResponses.REPORTS_DATA_NOT_FOUND,
                                data: [],
                                success:false
                            })
                        }

                    } else {
                        return resolve({
                            message: CONSTANTS.apiResponses.REPORTS_DATA_NOT_FOUND,
                            data: {
                                dataAvailable: false,
                                data: {
                                    categories: categories,
                                    tasks: tasksReport,
                                    projects: projectReport
                                }
                            }
                        })
                    }
                }
               
                await Promise.all(projectDetails.map(async function (project) {

                    if (project.categories) {
                        project.categories.map(category => {

                            if( 
                                category.externalId !== "" && categories[category.externalId] 
                            ) {
                                categories[category.externalId] = categories[category.externalId] + 1;
                            } else if ( categories[category.name] ) {
                                categories[category.name] = categories[category.name] + 1;
                            } else {
                                if( category.externalId !== "" ) {
                                    categories[category.externalId] = 1;
                                } else {
                                    categories[category.name] = 1;
                                }
                                
                            }
                        });
                        categories['total'] = categories['total'] + project.categories.length;
                    }

                    let todayDate = moment(project.endDate, "DD.MM.YYYY");
                    let endDate = moment().format();
                    if (project.status == CONSTANTS.common.COMPLETED_STATUS) {

                        projectReport[CONSTANTS.common.COMPLETED_STATUS] = projectReport[CONSTANTS.common.COMPLETED_STATUS] + 1;

                    } else if (project.status == CONSTANTS.common.INPROGRESS_STATUS) {

                        if (todayDate.diff(endDate, 'days') < 1) {
                            projectReport['overdue'] = projectReport['overdue'] + 1;
                        } else {
                            projectReport[CONSTANTS.common.INPROGRESS_STATUS] = projectReport[CONSTANTS.common.INPROGRESS_STATUS] + 1;
                        }

                    } else if (project.status == CONSTANTS.common.NOT_STARTED_STATUS) {

                        if (todayDate.diff(endDate, 'days') < 1) {
                            projectReport['overdue'] = projectReport['overdue'] + 1;
                        } else {
                            projectReport[CONSTANTS.common.NOT_STARTED_STATUS] = projectReport[CONSTANTS.common.NOT_STARTED_STATUS] + 1;
                        }
                    }
                    projectReport["total"] = projectReport[CONSTANTS.common.NOT_STARTED_STATUS] + 
                    projectReport['overdue'] + projectReport[CONSTANTS.common.INPROGRESS_STATUS] +
                    projectReport[CONSTANTS.common.COMPLETED_STATUS];

                    if (project.taskReport) {
                        let keys = Object.keys(project.taskReport);
                        keys.map(key => {
                            if (tasksReport[key]) {
                                tasksReport[key] = tasksReport[key] + project.taskReport[key];
                            } else {
                                tasksReport[key] = project.taskReport[key];
                            }
                        });
                    }

                    await Promise.all(project.tasks.map(task => {
                        let taskCurrentDate = moment(task.endDate, "DD.MM.YYYY");
                        if (taskCurrentDate.diff(endDate, 'days') < 1) {
                            if (tasksReport['overdue']) {
                                tasksReport['overdue'] = tasksReport['overdue'] + 1;
                            } else {
                                tasksReport['overdue'] = 1;
                            }
                            if(tasksReport[task.status]){
                                tasksReport[task.status] = tasksReport[task.status] - 1;
                            }
                        }
                    }));

                }));

                if (getPdf == true) {

                    let reportTaskData = {};
                    Object.keys(tasksReport).map(taskData => {
                        reportTaskData[UTILS.camelCaseToTitleCase(taskData)] = tasksReport[taskData];
                    })

                    let categoryData = {};
                    Object.keys(categories).map(category => {
                        categoryData[UTILS.camelCaseToTitleCase(category)] = categories[category];
                    })

                    let types = await this.types();
                    let returnTypeInfo = types.data.filter(type => {
                        if (type.value == reportType) {
                            return type.label;
                        }
                    });

                    let pdfRequest = {
                        "reportType": returnTypeInfo[0].label,
                        "sharedBy": userName,
                        "reportTitle": pdfReportString,
                        categories: categoryData,
                        tasks: reportTaskData,
                        projects: projectReport
                    }
                    if (programId != "") {
                        pdfRequest['programName'] = projectDetails[0].programInformation.name;
                    }
                    if (entityId != "") {
                        pdfRequest['entityName'] = projectDetails[0].entityInformation.name;
                    }

                    let response = await dhitiService.entityReport(userToken, pdfRequest);
                    if (response && response.success == true) {
                        return resolve({
                            success: true,
                            message: CONSTANTS.apiResponses.REPORT_GENERATED,
                            data: {
                                data: {
                                    downloadUrl: response.data.pdfUrl
                                }

                            }
                        });
                    }

                } else {

                    let response = {
                        categories: categories,
                        tasks: tasksReport,
                        projects: projectReport
                    }
                    return resolve({
                        success: true,
                        message: CONSTANTS.apiResponses.REPORTS_GENERATED,
                        data: {
                            dataAvailable: true,
                            data: response,
                        }
                    });

                }
            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        })
    }


    /**
      * Get programs list.
      * @method
      * @name getProgramsByEntity 
      * @param {String} userId - Logged in user id.
      * @param {String} entityId - entity id.
      * @param {String} pageSize - Size of page.
      * @param {String} pageNo - Recent page no.
      * @param {String} search - search text.
      * @param {String} userRole - User roles (optional) to be provided if entityId not given.
      * @returns {Object} -  returns programs list
     */

    static getProgramsByEntity(userId = "", entityId = "", pageSize, pageNo, search, userRole = "") {
        return new Promise(async (resolve, reject) => {
            try {

                let query = {
                    "userId": userId,
                    programId : {
                        $exists : true
                    }
                };

                if(entityId != "" && UTILS.isValidMongoId(entityId)) {
                    query.entityId = ObjectId(entityId);
                } 
                
                if (userRole != "") {
                    query.userRole = {
                        $in : [
                            "",
                            userRole
                        ]
                    }
                }


                let searchQuery = [];
                if (search !== "") {
                    searchQuery = [{ "programInformation.name": new RegExp(search, 'i') }];
                }

                let groupBy =  {
                        _id: '$programId',
                        "programName": { '$first': '$programInformation.name' },
                        programId: { '$first': '$programId' }
                }

                const projectDocuments = await userProjectsHelper.projects(
                    query,
                    pageSize,
                    pageNo,
                    searchQuery,
                    ["programInformation","programId", "userId"],
                    groupBy
                );

                if (projectDocuments.data && projectDocuments.data.count && projectDocuments.data.count == 0) {
                    return resolve({
                        message: CONSTANTS.apiResponses.PROGRAMS_NOT_FOUND,
                        data: []
                    })
                }

                let programs = [];
                let projectDetails = projectDocuments.data.data;
                for (let index = 0; index < projectDetails.length; index++) {
                    programs.push({
                        name: projectDetails[index].programName,
                        _id: projectDetails[index].programId.toString()
                    });
                }

                return resolve({
                    success: true,
                    message: CONSTANTS.apiResponses.PROGRAMS_FOUND,
                    data: {
                        data: programs,
                        count: projectDocuments.data.count
                    }
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        })
    }



    /**
      * Get report types
      * @method
      * @name types 
      * @returns {Object} - returns report types
     */
    static types() {
        return new Promise(async (resolve, reject) => {
            try {

                let reportTypes = [
                    {
                        label: "Weekly",
                        value: 0
                    },
                    {
                        label: "Monthly",
                        value: 1
                    }, {
                        label: "Quarterly",
                        value: 2
                    }]

                resolve({
                    success: true,
                    message: CONSTANTS.apiResponses.REPORT_TYPES_FOUND,
                    data: reportTypes,
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        })
    }

    /**
    * Detail view Report.
    * @method
    * @name detailView 
    * @param {String} userId - Logged in user id.
    * @param {String} userToken - Logged in user keyclock token.
    * @param {String} reportType - report type monthly or quterly.
    * @param {String} entityId - mapped entity id.
    * @param {String} programId - program id
    * @param {Boolean} getPdf - to get pdf 
    * @returns {Object} - response consist of chart report data
   */

    static detailView(userId, userToken, reportType, entityId = "", programId, getPdf) {
        return new Promise(async (resolve, reject) => {
            try {

                let query = {
                    isDeleted: { $ne: true }
                };

                if (entityId) {
                    query["entityId"] = ObjectId(entityId);
                } else {
                    query["userId"] = userId
                }

                let chartObject = [];
                let dateRange = await _getDateRangeofReport(reportType);
                let endOf = dateRange.endOf;
                let startFrom = dateRange.startFrom;

                query['$or'] = [
                    { "syncedAt": { $gte: new Date(startFrom), $lte: new Date(endOf) } },
                    { "tasks": { $elemMatch: { isDeleted: { $ne: true } ,syncedAt: { $gte: new Date(startFrom), $lte: new Date(endOf) } } } },
                ]

                if (programId) {
                    query['programId'] = ObjectId(programId);
                }

                const projectDetails = await userProjectsHelper.projectDocument(
                    query,
                    ["title",
                        "taskReport",
                        "status",
                        "tasks.status",
                        "tasks.startDate",
                        "tasks.endDate",
                        "tasks.name",
                        "categories",
                        "startDate",
                        "endDate"],
                    []
                );

                if (!projectDetails.length > 0) {

                    return resolve({
                        message: CONSTANTS.apiResponses.REPORTS_DATA_NOT_FOUND,
                        data: []
                    })
                }

                if (getPdf == true) {

                    let types = await this.types();
                    let returnTypeInfo = types.data.filter(type => {
                        if (type.value == reportType) {
                            return type.label;
                        }
                    });

                    let projectData = [];
                    await Promise.all(projectDetails.map(project => {
                        let projectInfo = {
                            startDate: project.startDate,
                            endDate: project.endDate,
                            status: project.status,
                            title: project.title,
                            tasks: []
                        }

                        project.tasks.map(task => {
                            projectInfo.tasks.push({
                                startDate: task.startDate,
                                endDate: task.endDate,
                                status: task.status,
                                title: task.name
                            })
                        })
                        projectData.push(projectInfo);
                    }));
                    let data = {
                        "reportType": returnTypeInfo[0].label,
                        "projectDetails": projectData
                    }
                    let response = await dhitiService.viewFullReport(userToken, data);

                    if (response && response.success == true) {

                        return resolve({
                            success: true,
                            message: CONSTANTS.apiResponses.REPORT_GENERATED,
                            data: {
                                data: {
                                    downloadUrl: response.data.pdfUrl
                                }
                            }
                        });
                    }

                } else {
                    await Promise.all(
                        projectDetails.map(async projectList => {

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
                            if (projectList.tasks && projectList.tasks.length > 0) {
                                await Promise.all(projectList.tasks.map(async taskList => {

                                    let status = taskList.status;

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
                                    if (status == CONSTANTS.common.NOT_STARTED_STATUS) {
                                        color = "#f5f5f5";
                                    } else if (status == CONSTANTS.common.COMPLETED_STATUS) {
                                        color = "#20ba8d";
                                    } else if (status == CONSTANTS.common.INPROGRESS_STATUS) {
                                        color = "#ef8c2b";
                                    }
                                    let obj = {
                                        name: taskList.name,
                                        id: taskList._id,
                                        color: color,
                                        start: moment.utc(taskList.startDate).valueOf(),
                                        end: moment.utc(taskList.endDate).valueOf()
                                    }

                                    reponseObj.xAxis.min = moment.utc(reponseObj.xAxis.min).valueOf('YYYY,mm,DD');
                                    reponseObj.xAxis.max = moment.utc(reponseObj.xAxis.max).valueOf('YYYY,mm,DD');
                                    reponseObj.series[0].data.push(obj);
                                })
                                )
                                chartObject.push(reponseObj);
                            }
                        })
                    )
                    resolve({
                        success: true,
                        message: CONSTANTS.apiResponses.REPORT_GENERATED,
                        data: chartObject
                    })
                }

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        });
    }
    
}

/**
  * Get date range for report
  * @method
  * @name _getDateRangeofReport 
  * @param {String} reportType - type of report
  * @returns {Object} - returns start and end date  
 */
function _getDateRangeofReport(reportType) {

    let startFrom = "";
    let endOf = "";
    if (reportType == 0) {
        let today = moment();
        startFrom = today.startOf('week').format('YYYY-MM-DD');
        endOf = today.endOf('week').format('YYYY-MM-DD');
    }
    else if (reportType == 1) {
        endOf = moment().subtract(0, 'months').endOf('month').format('YYYY-MM-DD');
        startFrom = moment().subtract(0, 'months').startOf('month').format('YYYY-MM-DD');
    } else {
        startFrom = moment().quarter(moment().quarter()).startOf('quarter').format('YYYY-MM-DD');
        endOf = moment().quarter(moment().quarter()).endOf('quarter').format('YYYY-MM-DD');
    }
    return { startFrom: startFrom, endOf: endOf };

}




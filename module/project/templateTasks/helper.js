/**
 * name : helper.js
 * author : Aman
 * created-date : 22-July-2020
 * Description : Project templates tasks helper functionality.
 */

/**
    * ProjectTemplateTasksHelper
    * @class
*/

// Dependencies
const projectTemplatesHelper = require(MODULES_BASE_PATH + "/project/templates/helper");
const learningResourcesHelper = require(MODULES_BASE_PATH + "/learningResources/helper");
const assessmentService = require(GENERICS_FILES_PATH + "/services/assessment");

module.exports = class ProjectTemplateTasksHelper {

    /**
     * Lists of tasks.
     * @method
     * @name taskDocuments
     * @param {Array} [filterData = "all"] - tasks filter query.
     * @param {Array} [fieldsArray = "all"] - projected fields.
     * @param {Array} [skipFields = "none"] - field not to include
     * @returns {Array} Lists of tasks. 
     */
    
    static taskDocuments(
        filterData = "all", 
        fieldsArray = "all",
        skipFields = "none"
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let queryObject = (filterData != "all") ? filterData : {};
                let projection = {}
           
                if (fieldsArray != "all") {
                    fieldsArray.forEach(field => {
                        projection[field] = 1;
                   });
               }
               
               if( skipFields !== "none" ) {
                   skipFields.forEach(field=>{
                       projection[field] = 0;
                   });
               }
               
               let tasks = 
               await database.models.projectTemplateTasks.find(
                   queryObject, 
                   projection
               ).lean();
           
               return resolve(tasks);
           
           } catch (error) {
               return reject(error);
           }
       });
    }

    /**
     * Extract csv information.
     * @method
     * @name extractCsvInformation
     * @param {Array} csvData - csv data.
     * @param {String} projectTemplateId - project template id.
     * @returns {Array} Lists of tasks.
     */
    
    static extractCsvInformation(
        csvData,
        projectTemplateId
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                let taskIds = [];
                let solutionIds = [];
                let systemId = false;
                let solutionExists = false;

                csvData.forEach(data => {
                    
                    let parsedData = UTILS.valueParser(data);

                    if( parsedData._SYSTEM_ID ) {
                        taskIds.push(parsedData._SYSTEM_ID);
                        systemId = true;
                    } else {
                        taskIds.push(parsedData.externalId);
                    }

                    if ( parsedData.solutionId && parsedData.solutionId !== "" ) {
                        solutionExists = true;
                        solutionIds.push(parsedData.solutionId);
                    }

                });

                let tasks = {};

                if( taskIds.length > 0 ) {

                    let filterData = {};

                    if( systemId ) {
                        filterData = {
                            _id : { $in : taskIds }
                        }
                    } else {
                        filterData = {
                            externalId : { $in : taskIds }
                        }
                    }

                    let tasksData = await this.taskDocuments(
                        filterData,
                        ["_id","children","externalId","projectTemplateId","parentId"]
                    );

                    if( tasksData.length > 0 ) {
                        tasksData.forEach(task=> {
                            if( systemId ) {
                                tasks[task._id.toString()] = task;
                            } else {
                                tasks[task.externalId] = task;
                            }
                        });
                    }
                }

                let projectTemplate = 
                await projectTemplatesHelper.templateDocument({
                    status : CONSTANTS.common.PUBLISHED,
                    _id : projectTemplateId
                },["_id","entityType","externalId"]);

                if( !projectTemplate.length > 0 ) {
                    throw {
                        message : CONSTANTS.apiResponses.PROJECT_TEMPLATE_NOT_FOUND,
                        status : HTTP_STATUS_CODE['bad_request'].status
                    }
                }

                if( solutionExists && !projectTemplate[0].entityType ) {
                    throw {
                        message : CONSTANTS.apiResponses.ENTITY_TYPE_NOT_FOUND_IN_TEMPLATE,
                        status : HTTP_STATUS_CODE['bad_request'].status
                    }
                }

                let solutionData = {};

                if ( solutionIds.length > 0 ) {
                    
                    let solutions = 
                    await assessmentService.listSolutions(solutionIds);

                    if( !solutions.success ) {
                        throw {
                            message : CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
                            status : HTTP_STATUS_CODE['bad_request'].status
                        }
                    }

                    if ( 
                        solutions.data &&
                        Object.keys(solutions.data).length > 0 
                    ) {

                        solutions.data.forEach(solution => {
                            if(!solutionData[solution.externalId]) {
                                solutionData[solution.externalId] = solution;
                            }
                        });
                    }
                }

                return resolve({
                    success : true,
                    data : {
                        tasks : tasks,
                        template : projectTemplate[0],
                        solutionData : solutionData
                    }
                });

           } catch (error) {
               return resolve({
                   message : error.message,
                   success : false,
                   status : error.status ? error.status : HTTP_STATUS_CODE['internal_server_error'].status
               });
           }
       });
    }

    /**
     * Create a task.
     * @method
     * @name createOrUpdateTask
     * @param {Object} data - task data.
     * @param {String} templateId - template task id
     * @param {Object} solutionData - solution data
     * @param {String} [update = false]
     * @returns {Array} Create or update a task. 
     */
    
    static createOrUpdateTask( 
        data,
        template,
        solutionData,
        update = false
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                let parsedData = UTILS.valueParser(data);

                let allValues = {
                    type : parsedData.type
                };

                let solutionTypes = [
                    CONSTANTS.common.ASSESSMENT,
                    CONSTANTS.common.OBSERVATION,
                    CONSTANTS.common.IMPROVEMENT_PROJECT
                ]

                if ( allValues.type === CONSTANTS.common.CONTENT ) {

                    let learningResources = 
                    await learningResourcesHelper.extractLearningResourcesFromCsv(parsedData);
                    
                    allValues.learningResources = learningResources.data;

                } else if ( solutionTypes.includes(allValues.type) ) { 

                    allValues.solutionDetails = {};

                    if( parsedData.solutionType && parsedData.solutionType !== "" ) {
                        allValues.solutionDetails.type = parsedData.solutionType; 
                    } else {
                        parsedData.STATUS = 
                        CONSTANTS.apiResponses.REQUIRED_SOLUTION_TYPE;
                    }
                    
                    if ( parsedData.solutionSubType && parsedData.solutionSubType !== "" ) {
                        allValues.solutionDetails.subType = parsedData.solutionSubType;
                    } else {
                        parsedData.STATUS = 
                        CONSTANTS.apiResponses.REQUIRED_SOLUTION_SUB_TYPE;
                    }

                    if ( parsedData.solutionId && parsedData.solutionId !== "" ) {

                        if ( !solutionData[parsedData.solutionId] ) {
                            parsedData.STATUS = 
                            CONSTANTS.apiResponses.SOLUTION_NOT_FOUND;
                        } else {

                            if( 
                                solutionData[parsedData.solutionId].type !== 
                                allValues.solutionDetails.type 
                            ) {
                                
                                parsedData.STATUS = 
                                CONSTANTS.apiResponses.SOLUTION_TYPE_MIS_MATCH;
                            }

                            if( 
                                solutionData[parsedData.solutionId].subType !== 
                                allValues.solutionDetails.subType
                            ) {
                                parsedData.STATUS = 
                                CONSTANTS.apiResponses.SOLUTION_SUB_TYPE_MIS_MATCH;
                            }

                            if( 
                                template.entityType !== solutionData[parsedData.solutionId].entityType 
                            ) {
                                parsedData.STATUS = 
                                CONSTANTS.apiResponses.MIS_MATCHED_PROJECT_AND_TASK_ENTITY_TYPE;
                            } else {

                                allValues.solutionDetails = 
                                _.pick(
                                    solutionData[parsedData.solutionId],
                                    ["_id","isReusable","externalId","name","programId","type","subType","allowMultipleAssessemts","isRubricDriven","criteriaLevelReport","scoringSystem"]
                                );
                            }

                        }

                    } else {
                        parsedData.STATUS = 
                        CONSTANTS.apiResponses.REQUIRED_SOLUTION_ID;
                    }

                }

                allValues.projectTemplateId = template._id;
                allValues.projectTemplateExternalId = template.externalId;

                let templateTaskSchema = schemas["project-template-tasks"].schema;

                let templateTasksData = Object.keys(templateTaskSchema);
                let booleanData = UTILS.getAllBooleanDataFromModels(templateTaskSchema);

                Object.keys(parsedData).forEach( eachParsedData => {
                    if( 
                        templateTasksData.includes(eachParsedData) && 
                        !allValues[eachParsedData] 
                    ) {
                        if( booleanData.includes(eachParsedData) ) {
                            if( parsedData[eachParsedData] !== "" ) {
                                allValues[eachParsedData] = 
                                UTILS.convertStringToBoolean(parsedData[eachParsedData]);
                            }
                        } else {
                            allValues[eachParsedData] = parsedData[eachParsedData]; 
                        }
                    }
                });

                if( !parsedData.STATUS ) {

                    let taskData = {};

                    if( !update ) {
                        taskData = 
                        await database.models.projectTemplateTasks.create(allValues);
                        if ( !taskData._id ) {
                            parsedData.STATUS = 
                            CONSTANTS.apiResponses.PROJECT_TEMPLATE_TASKS_NOT_CREATED;
                        } else {
                            parsedData._SYSTEM_ID = taskData._id;
                            parsedData.STATUS = CONSTANTS.apiResponses.SUCCESS;
                        }
    
                    } else {
                        
                        taskData = 
                        await database.models.projectTemplateTasks.findOneAndUpdate({
                            _id :  parsedData._SYSTEM_ID
                        },{
                            $set : allValues
                        });

                        parsedData.STATUS = CONSTANTS.apiResponses.SUCCESS;
                    }
    
                    if( taskData._id ) {
                            
                        if( parsedData.hasAParentTask === "YES" ) { 
                    
                            let parentTask =
                            await database.models.projectTemplateTasks.findOneAndUpdate({
                                externalId : parsedData.parentTaskId
                            },{
                                $addToSet : {
                                    children : taskData._id
                                },
                                $set : {
                                    hasSubTasks : true
                                }
                            },{
                                returnOriginal : true
                            });

                            if( parentTask._id ) {
                                
                                let visibleIf = [];
                                
                                let operator = 
                                parsedData["parentTaskOperator"] === "EQUALS" ? 
                                "===" : parsedData["parentQuestionOperator"];
                                
                                visibleIf.push({
                                    operator : operator,
                                    _id : parentTask._id,
                                    value : parsedData.parentTaskValue
                                });
                                
                                await database.models.projectTemplateTasks.findOneAndUpdate({
                                    _id : taskData._id
                                },{
                                    $set : {
                                        parentId : parentTask._id,
                                        visibleIf : visibleIf
                                    }
                                });

                                if( update ) {
                                    parsedData._parentTaskId = parentTask._id;
                                }
                            }
                        }

                        await projectTemplatesHelper.updateProjectTemplateDocument
                        (
                            { _id : template._id },
                            { $addToSet : { tasks : ObjectId(taskData._id) } }
                        )
                    }
                }

                return resolve(
                    _.omit(parsedData,["createdBy","updatedBy"])
                );
           
           } catch (error) {
               return reject(error);
           }
       });
    }

    /**
      * Bulk create project template tasks.
      * @method
      * @name bulkCreate
      * @param {Array} tasks - csv tasks data.
      * @param {String} projectTemplateId - project template id.
      * @param {String} userId - user logged in id.
      * @returns {Object} Bulk create project template tasks.
     */

    static bulkCreate( tasks,projectTemplateId,userId ) {
        return new Promise(async (resolve, reject) => {
            try {

                const fileName = `create-project-template-tasks`;
                let fileStream = new CSV_FILE_STREAM(fileName);
                let input = fileStream.initStream();
      
                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                let csvData = 
                await this.extractCsvInformation(
                    tasks,
                    projectTemplateId
                );

                if( !csvData.success ) {
                    return resolve(csvData);
                }

                let pendingItems = [];

                for ( let task = 0; task < tasks.length ; task ++ ) {
                    let currentData = UTILS.valueParser(tasks[task]);
                    currentData.createdBy = currentData.updatedBy = userId;

                    if( 
                        currentData["hasAParentTask"] === "YES" &&
                        !csvData.data.tasks[currentData.parentTaskId]
                    ) {
                        pendingItems.push(currentData);
                    } else {
                        
                        if( csvData.data.tasks[currentData.externalId] ) {
                            currentData._SYSTEM_ID = CONSTANTS.apiResponses.PROJECT_TEMPLATE_TASK_EXISTS;
                            input.push(currentData);
                        } else {
                            
                            let createdTask = 
                            await this.createOrUpdateTask(
                                currentData,
                                csvData.data.template,
                                csvData.data.solutionData
                            );

                            input.push(createdTask);
                        }
                    }
                }

                if ( pendingItems && pendingItems.length > 0 ) {
                    
                    for ( let item = 0; item < pendingItems.length ; item ++ ) {
                        
                        let currentData = pendingItems[item];
                        currentData.createdBy = currentData.updatedBy = userId;

                        if( csvData.data.tasks[currentData.externalId] ) {
                            currentData._SYSTEM_ID = CONSTANTS.apiResponses.PROJECT_TEMPLATE_TASK_EXISTS;
                            input.push(currentData);
                        } else {
                            
                            let createdTask = await this.createOrUpdateTask(
                                currentData,
                                csvData.data.template,
                                csvData.data.solutionData,
                                csvData.data.observationData
                            );

                            input.push(createdTask);
                        }

                    }
                }

                input.push(null);

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Bulk update project template tasks.
      * @method
      * @name bulkUpdate
      * @param {Array} tasks - csv tasks data.
      * @param {String} projectTemplateId - project template id.
      * @param {String} userId - user logged in id.
      * @returns {Object} Bulk update project template tasks.
     */

    static bulkUpdate( tasks,projectTemplateId,userId ) {
        return new Promise(async (resolve, reject) => {
            try {

                const fileName = `update-project-template-tasks`;
                let fileStream = new CSV_FILE_STREAM(fileName);
                let input = fileStream.initStream();
      
                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                let csvData = 
                await this.extractCsvInformation(
                    tasks,
                    projectTemplateId
                );

                if( !csvData.success ) {
                    return resolve(csvData);
                }

                let tasksData =  Object.values(csvData.data.tasks);

                if ( csvData.data.tasks && tasksData.length > 0 ) {

                    tasksData.forEach(task=>{
                        if ( task.children && task.children.length > 0 ) {
                            task.children.forEach(children=>{
                                if( csvData.data.tasks[children.toString()] ) {
                                    csvData.data.tasks[children.toString()].parentTaskId = task._id.toString();
                                }
                            })
                        }
                    })
                }

                for ( let task = 0; task < tasks.length ; task ++ ) { 
                    
                    let currentData = UTILS.valueParser(tasks[task]);

                    if ( 
                        !currentData._SYSTEM_ID || 
                        !currentData._SYSTEM_ID === "" || 
                        !csvData.data.tasks[currentData["_SYSTEM_ID"]] 
                    ) {
                        currentData.STATUS = 
                        CONSTANTS.apiResponses.INVALID_TASK_ID;
                        input.push(currentData);
                        continue;
                    }

                    currentData.updatedBy = userId;
                    
                    let createdTask = 
                    await this.createOrUpdateTask(
                        _.omit(currentData,["STATUS"]),
                        csvData.data.template,
                        csvData.data.solutionData,
                        true  
                    );

                    if( 
                        csvData.data.tasks[currentData._SYSTEM_ID].parentId && 
                        csvData.data.tasks[currentData._SYSTEM_ID].parentId.toString() !== createdTask._parentTaskId.toString()
                    ) {

                        await database.models.projectTemplateTasks.findOneAndUpdate(
                            {
                              _id: csvData.data.tasks[currentData._SYSTEM_ID].parentId
                            },
                            {
                              $pull: { children : ObjectId(currentData._SYSTEM_ID) }
                            }
                          );

                    }

                    input.push(createdTask);
                }

                input.push(null);

            } catch (error) {
                return reject(error);
            }
        })
    }
};

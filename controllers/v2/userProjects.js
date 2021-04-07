/**
 * name : userProjects.js
 * author : Aman
 * created-date : 28-Dec-2020
 * Description : User Projects v2 related information.
 */

// Dependencies
const v1UserProjects = require(PROJECT_ROOT_DIRECTORY + "/controllers/v1/userProjects");
const userProjectsHelper = require(MODULES_BASE_PATH + "/userProjects/helper");

/**
    * UserProjects
    * @class
*/

module.exports = class UserProjects extends v1UserProjects {
    
     /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     *  @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */

    /**
    * @api {post} /improvement-project/api/v2/userProjects/details/:projectId?programId=:programId&solutionId=:solutionId&templateId=:templateId
    * Project Details.
    * @apiVersion 2.0.0
    * @apiGroup User Projects
    * @apiSampleRequest /improvement-project/api/v2/userProjects/details/5f731631e8d7cd3b88ac0659?programId=5f4e538bdf6dd17bab708173&solutionId=5f8688e7d7f86f040b77f460&templateId=IDEAIMP4
    * @apiParamExample {json} Request:
    {
        "role" : "HM",
   		"state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
        "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
        "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
    }
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully fetched project details",
    "status": 200,
    "result": {
        "_id": "5f97d2f6bf3a3b1c0116c80a",
        "status": "notStarted",
        "isDeleted": false,
        "categories": [
            {
                "_id": "5f102331665bee6a740714e8",
                "name": "Teachers",
                "externalId": "teachers"
            },
            {
                "name": "newCategory",
                "externalId": "",
                "_id": ""
            }
        ],
        "tasks": [
            {
                "_id": "289d9558-b98f-41cf-81d3-92486f114a49",
                "name": "Task 1",
                "description": "Task 1 description",
                "status": "notStarted",
                "isACustomTask": false,
                "startDate": "2020-09-29T09:08:41.667Z",
                "endDate": "2020-09-29T09:08:41.667Z",
                "lastModifiedAt": "2020-09-29T09:08:41.667Z",
                "type": "single",
                "isDeleted": false,
                "attachments": [
                    {
                        "name": "download(2).jpeg",
                        "type": "image/jpeg",
                        "sourcePath": "projectId/userId/imageName"
                    }
                ],
                "remarks": "Tasks completed",
                "assignee": "Aman",
                "children": [
                    {
                        "_id": "289d9558-b98f-41cf-81d3-92486f114a50",
                        "name": "Task 2",
                        "description": "Task 2 description",
                        "status": "notStarted",
                        "children": [],
                        "isACustomTask": false,
                        "startDate": "2020-09-29T09:08:41.667Z",
                        "endDate": "2020-09-29T09:08:41.667Z",
                        "lastModifiedAt": "2020-09-29T09:08:41.667Z",
                        "type": "single",
                        "isDeleted": false,
                        "externalId": "task 2",
                        "isDeleteable": false,
                        "createdAt": "2020-10-28T05:58:24.907Z",
                        "updatedAt": "2020-10-28T05:58:24.907Z",
                        "isImportedFromLibrary": false
                    }
                ],
                "externalId": "task 1",
                "isDeleteable": false,
                "createdAt": "2020-10-28T05:58:24.907Z",
                "updatedAt": "2020-10-28T05:58:24.907Z",
                "isImportedFromLibrary": false
            }
        ],
        "resources": [],
        "deleted": false,
        "lastDownloadedAt": "2020-09-29T09:08:41.667Z",
        "__v": 0,
        "description": "Project 1 description"
    }
    }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Project details
      * @method
      * @name details
      * @param {Object} req - request data.
      * @param {String} req.params._id - Project id.
      * @returns {JSON} Create Self projects.
     */

    async details(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let projectDetails = 
                await userProjectsHelper.detailsV2(
                    req.params._id ? req.params._id : "",
                    req.query.solutionId,
                    req.userDetails.userInformation.userId,
                    req.userDetails.userToken,
                    req.body,
                    req.headers["x-app-id"]  ? 
                    req.headers["x-app-id"]  : 
                    req.headers.appname ? req.headers.appname : "",
                    req.headers["x-app-ver"] ? 
                    req.headers["x-app-ver"] : 
                    req.headers.appversion ? req.headers.appversion : "",
                    req.query.templateId
                );

                projectDetails.result = projectDetails.data;

                return resolve(projectDetails);

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
                    errorObject: error
                });
            }
        })
    }
}
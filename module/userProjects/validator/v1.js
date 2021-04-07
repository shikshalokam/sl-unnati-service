/**
 * name : v1.js
 * author : Aman
 * created-date : 25-Aug-2020
 * Description : Projects.
 */

module.exports = (req) => {

    let projectsValidator = {

        createSelf : function () {
            req.checkBody('title').exists().withMessage("required project title");
            req.checkBody('categories').exists().withMessage("required categories for project");
        },
        importFromLibrary : function () {
            req.checkParams('_id').exists().withMessage("required project template id");
        },
        sync : function () {
            req.checkParams('_id').exists().withMessage("required project id");
            req.checkQuery('lastDownloadedAt').exists().withMessage("required last downloaded at");
        },
        details : function () {
            req.checkParams('_id').exists().withMessage("required project id");
        },
        tasksStatus : function () {
            req.checkParams('_id').exists().withMessage("required project id");
        },
        solutionDetails : function () {
            req.checkParams('_id').exists().withMessage("required project id");
            req.checkQuery('taskId').exists().withMessage("required task id");
        },
        bulkCreateByUserRoleAndEntity :  function () {
            req.checkBody('templateId').exists().withMessage("required template id");
            req.checkBody('entityId').exists().withMessage("required entity id");
            req.checkBody('role').exists().withMessage("required role");
        },
        add : function () {
            req.checkBody('title').exists().withMessage("required project title");
        },
        share : function () {
            req.checkParams('_id').exists().withMessage("required project id");
        }
    }

    if (projectsValidator[req.params.method]) {
        projectsValidator[req.params.method]();
    }

};
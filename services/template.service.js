/**
 * @template.service.js
 *
 * templates api related functionalities are written below
 */

/**
 * Loading Application level configuration data
 */
var config = require('../config/config.json');
var templateModel = require('../models/impTemplates.js');
var winston = require('../config/winston');
var mongoose = require('../node_modules/mongoose');
var commonHandler = require('../helpers/common-handler');



/**
 * Loading external libraries used here
 */




var _this = this;
var api = {};
api.getTemplates = getTemplates;
module.exports = api;


/**
 * @getTemplates the function used to get all the templates
 * @return the templates based on group
 */
function getTemplates(req) {
    return new Promise(async function (resolve, reject) {
        try {
            let templateInfo = await templateModel.find({});
            let array = [];
            let data = {};
            if (templateInfo.length > 0) {
                await Promise.all(templateInfo.map(async function (item) {
                    await Promise.all(item.category.map(async function (ele) {
                        if (array.includes(ele)) {
                            data[ele].push(item);
                        } else {
                            array.push(ele);
                            data[ele] = [];
                            data[ele].push(item);
                        }
                    }));
                }));
                resolve({ status: "success", "data": data, "message": "all template data featched successfully" });
            } else {
                resolve({ status: "failed", "data": [], "message": "no template found" });
            }
        } catch (error) {
            winston.error(error);
            reject({ status: "failed", message: error })
        }
    })
}

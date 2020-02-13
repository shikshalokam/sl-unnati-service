/**
 * name : user-management.service.js
 * author : Aman Jung Karki
 * created-date : 25-Nov-2019
 * Description : All user management service related information.
 */

// Dependencies
var request = require('request');
var config = require('../config/config.json');

 /**
      * All user profile lists.
      * @method
      * @name userProfileList                 
      * @returns {Array} List of all user profile lists.
*/

function userProfileList() {
    return new Promise(async function (resolve, reject) {
        try {

            let userProfileListUrl = 
            config.userManagementService.HOST+
            config.userManagementService.BASE_URL+
            config.URL_PREFIX + 
            config.userManagementService.userProfileList;

            const _userManagementCallBack = function (err, response) {
                if (err) {
                    logger.error("Failed to connect to user management service.");
                } else {
                    let userManagementData = JSON.parse(response.body);
                    return resolve(userManagementData);
                }
            }

            request.get( userProfileListUrl,{
                    headers: {
                        "internal-access-token" : config.INTERNAL_ACCESS_TOKEN
                    }
                },
                _userManagementCallBack
            )

        } catch (error) {
            reject({ status: "failed", message: error })
        }
    })
}

module.exports = {
    userProfileList : userProfileList
};

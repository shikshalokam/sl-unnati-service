/**
 * name : user-management.js.
 * author : Aman Karki.
 * created-date : 21-July-2021.
 * Description :  User Management service health check functionality.
*/

// Dependencies 

const request = require('request');
var config = require('../config/config.json');

/**
   * User Management service health check.
   * @function
   * @name health_check
   * @returns {Boolean} - true/false.
*/

function health_check() {
    return new Promise(async (resolve, reject) => {
        try {

            let healthCheckUrl = config.userManagementService.HOST + "/healthCheckStatus";

            const options = {
                headers : {
                    "content-type": "application/json"
                }
            };
            
            request.get(healthCheckUrl,options,userManagementCallback);

            function userManagementCallback(err, data) {

                let result = false;

                if (err) {
                    result = false;
                } else {
                    
                    let response = JSON.parse(data.body);
                    if( response.status === 200 ) {
                        result = true;
                    } else {
                        result = false;
                    }
                }
                return resolve(result);
            }

        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    health_check : health_check
}
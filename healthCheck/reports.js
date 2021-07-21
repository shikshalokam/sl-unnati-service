/**
 * name : reports.js.
 * author : Aman Karki.
 * created-date : 21-July-2021.
 * Description : Reports service health check functionality.
*/

// Dependencies 

const request = require('request');
var config = require('../config/config.json');

/**
   * Reports service health check.
   * @function
   * @name health_check
   * @returns {Boolean} - true/false.
*/

function health_check() {
    return new Promise(async (resolve, reject) => {
        try {

            let healthCheckUrl = 
            process.env.config.dhiti_config.api_base_url +  "/healthCheckStatus";

            const options = {
                headers : {
                    "content-type": "application/json"
                }
            };
            
            request.get(healthCheckUrl,options,reportsCallback);

            function reportsCallback(err, data) {

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
/**
 * name : user-profile-update.js
 * author : Aman Jung Karki
 * Date : 13-feb-2020
 * Description : All user profile update scheduler
 */

// dependencies
const userProfileHelpers = require("../../module/user-profile/helper");
const configuration = require("../../config/config.json");

/**
  * Completed Assessment functionality. 
  * @function
  * @name completedAssessment
  * @returns {Promise} return a Promise.
*/

let completedAssessment = function () {
  nodeScheduler.scheduleJob(configuration.cronConfiguration.userProfileUpdateScheduler, () => {

    console.log("<---- User profile update cron started ---->", new Date());

    return new Promise(async (resolve, reject) => {
      try{

        await userProfileHelpers.userProfileNotifications();
  
        console.log("<--- User profile update cron stopped ---->", new Date());
        resolve();
      } catch(error){
        return reject(error);
      }

    })

  });
}

module.exports = completedAssessment;
/**
 * name : user-profile.controller.js
 * author : Aman Jung Karki
 * created-date : 25-Nov-2019
 * Description : All user profile related information.
 */

// Dependencies

var express = require('express');
var router = express.Router();
let userProfileHelpers = require("../../module/user-profile/helper");

router.get('/userProfileNotifications', userProfileNotifications);

 /**
      * All user profile notifications.
      * @method
      * @name userProfileList
      * @param {Object} req - requested data.
      * @param {Object} res - All response data.                  
      * @returns {Array} List of all user profile lists.
*/

function userProfileNotifications(req, res) {

    return new Promise(async function (resolve, reject) {
        try {
            let userProfileLists = 
            await userProfileHelpers.userProfileNotifications();

            res.send(userProfileLists);
            
        } catch(err) {
            res.send({
                status : 500,
                message : err.message
            });
        }
    });
}

module.exports = router;
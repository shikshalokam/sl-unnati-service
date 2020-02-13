/**
 * name : userProfile/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All user profile helper related information.
 */

// Dependencies

var userManagementService = require('../../services/user-management.service');
let kafkaCommunication = require("../../helpers/kafka-communication");

module.exports = class UserProfileHelper {

    /**
   * User profile lists helper functions.
   * @method
   * @name userProfileNotifications
   * @returns {Array} Array of kafka notifications.
   */

    static userProfileNotifications() {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileLists = 
                await userManagementService.userProfileList();
    
                let userProfileData = {
                        "is_read" : false,
                        "action" : "Update",
                        "appName" : "unnati",
                        "created_at" : new Date(),
                        "text" : "text",
                        "type" : "Information",
                        "internal" : false,
                        "payload" : {
                            "type" : "improvement project"
                        },
                        "appType" : "improvement-project"
                };
    
                let response = [];
    
                if( userProfileLists.result && userProfileLists.result.length > 0 ) {
                    
                    for( let pointerToUserProfileList = 0; 
                        pointerToUserProfileList < userProfileLists.result.length; 
                        pointerToUserProfileList++
                    ) {
                        
                        let responseData = {
                            success : false
                        };
                        
                        let userProfileList = 
                        userProfileLists.result[pointerToUserProfileList];
                        
                        if( !userProfileList.sentPushNotifications ) {
                            
                            let userObj = {...userProfileData};
                            userObj["user_id"] = userProfileList.userId;
                            userObj["verified"] = userProfileList.verified;
                            userObj["title"] = 
                            userProfileList.verified ?
                            "Thank you for verifing" :
                            "Please update your details.Help us make your experience better.";
                            
                            let sendUserProfileNotification = 
                            await kafkaCommunication.pushUserProfileNotificationsToKafka(
                                userObj
                            );
    
                            if (sendUserProfileNotification.status != "success") {
                                throw new Error(`Failed to push user profile notification for user ${userProfileList.userId}`);
                            }
        
                            responseData.success = true;
                            responseData["message"] = `successfully pushed user profile information to kafka for user ${userProfileList.userId}`;
    
                        } else {
                            responseData["message"] = `In-app and push notifications sent for userId ${userProfileList.userId}`;
                        }
    
                        response.push(responseData);
                    }
                }
    
                return resolve(response);

            } catch (error) {
                return reject(error);
            }
        })
    }

};
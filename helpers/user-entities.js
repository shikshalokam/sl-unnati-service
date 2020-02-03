// var http = require('http');
// var https = require('https');
var Request = require("request");
// var apiUrl = require('../config/api-url');
var config = require('../config/config');
var winston = require('../config/winston');


var api = {};
api.userEntities = userEntities;
module.exports = api;


/**
 * 
 * @param {*} req 
 * 
 * The fallowing function is used to get the school list 
 * it makes api call to samiksha to get the user entity 
 */
async function userEntities(req) {
    return new Promise(async (resolve, reject) => {
        try {


            let profileData = await getUserProfile(req);

            // console.log("profileData",  profileData.data);


            // resolve({
            //     status:"failed",
            //     data:profileData.data
            // });

            if (profileData.data) {


                try{

                    profileData = JSON.parse(profileData.data);

                }catch(exp){

                    return resolve({
                        status:"failed",
                        data:"data not found"                        
                    })

                }
                
                //  console.log("profileData",profileData);


                if (profileData.result._id) {


                    // console.log("req.query.search",req.query.search);
                    // if(profileData)
                    let searchQuery = "";
                    if (req.query.search) {
                        searchQuery = "&search=" + req.query.search;
                    }
                    let url = config.userExtension.base + config.userExtension.userExtensionEntity + req.body.userId + "?entityType=school&limit=" + req.query.limit + "&page=" + req.query.page + searchQuery; // + req.params.term + "/standings";
                    // console.log("url", url);
                    Request.get({
                        "headers": {
                            'X-Channel-id': config.x_channel_id,
                            'X-authenticated-user-token': req.headers['x-auth-token'],
                            'Authorization': "Bearer " + req.headers['x-auth-token'],
                            'Content-Type': "application/json"
                        },
                        "url": url,
                    }, (error, response, body) => {
                        if (error) {


                            let obj = {
                                status: "failed",
                                // message: "failed during fetching school details ",
                                errorObject: error,
                                message: error.message,
                                stack: error.stack
                            };
                            winston.error(obj);
                            return reject(obj);
                        }

                        let incomingData = JSON.parse(response.body);
                        console.log("incomingData",incomingData);
                        if (incomingData.status == 200) {


                            return resolve({
                                status: "success",
                                data: body,
                                response: response,
                                profileData:profileData
                            })
                        } else {
                            return resolve({
                                status: "failed",
                                data: "Data Not Found"

                            })
                        }

                    });

                } else {
                    return resolve({
                        status: "failed",
                        data: "Data Not Found"

                    })

                }
            }else{
                return reject({
                    status:"failed",

                    data:"data not found"

                })
            }
        } catch (error) {

            // console.log
            let obj = {
                status: "failed",
                // message: "failed during fetching school details ",
                errorObject: error,
                message: error.message,
                stack: error.stack
            };
            winston.error(obj);
            return reject(obj);
        }
        finally {
        }
    });
}

async function getUserProfile(req) {
    return new Promise(async (resolve, reject) => {
        try {


            let url = config.userExtension.base + config.userExtension.userProfile + req.body.userId;
            // console.log("url", url);
            Request.get({
                "headers": {
                    'X-Channel-id': config.x_channel_id,
                    'X-authenticated-user-token': req.headers['x-auth-token'],
                    'Authorization': "Bearer " + req.headers['x-auth-token'],
                    'Content-Type': "application/json"
                },
                "url": url,
            }, (error, response, body) => {
                if (error) {


                    let obj = {
                        status: "failed",
                        // message: "failed during fetching school details ",
                        errorObject: error,
                        message: error.message,
                        stack: error.stack
                    };
                    winston.error(obj);
                    return reject(obj);
                }

                // console.log("data",body);
                let incomingData = JSON.parse(response.body);
                if (incomingData.status == 200) {


                    return resolve({
                        status: "success",
                        data: body,
                    })
                } else {

                    return resolve({
                        status: "failed",
                        data: "not found"

                    })


                }

            });

        } catch (error) {
            let obj = {
                status: "failed",
                // message: "failed during fetching school details ",
                errorObject: error,
                message: error.message,
                stack: error.stack
            };
            winston.error(obj);
            return reject(obj);
        }
        finally {
        }
    });
}
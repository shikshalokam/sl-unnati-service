/**
 * External dependencies for the file
 */
var http = require('http');
var https = require('https');
var request = require('request');


/**
 * Internal dependencie files
 */
var config = require('../config/config.json');
var winston = require('../config/winston');




var api = {};

api.httpsPost = httpsPost;
api.httpsGet = httpsGet;
module.exports = api;

/**
 * httpsPost() is used to make post api call
 * @param {*} headers holds header information for api calls
 * @param {*} body request body
 * @param {*} url url of the request
 */
async function httpsPost(headers,postData,url){
    return  new Promise( async(resolve,reject)=>{
        try {
            console.log(postData,"url",url)
            request({
                url: url,
                method: "POST",
                headers: headers,
                json: true,   // <--Very important!!!
                body: postData[0]
            }, function (error, response, body){
               if (error) {
                   console.log("error",error);
                    winston.error("Error at httpPost()" + error);
                    reject(body);
                } else {
                    console.log(response.statusCode,"body",body);
                    resolve(body);
                }
            });
        } catch (error) {
            winston.error("error occured while calling httpsPost()"+error);
        }
    });
}

/**
 * httpsGet() is used to make get api call
 * @param {*} headers holds header information for api calls
 * @param {*} body request body
 * @param {*} url url of the request
 */
async function httpsGet(headers,url){
    return  new Promise( async(resolve,reject)=>{
        try {
            // console.log("url",url)
            request({
                url: url,
                method: "get",
                headers: headers,
            }, function (error, response, body){
               if (error) {
                   console.log("error",error);
                    winston.error("Error at httpPost()" + error);
                    reject(body);
                } else {
                    // console.log("body",body);
                    resolve(body);
                }
            });
        } catch (error) {
            winston.error("error occured while calling httpsPost()"+error);
        }
    });
}
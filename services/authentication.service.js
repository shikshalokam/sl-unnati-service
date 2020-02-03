/**
 * @authnsentication.service.js
 *
 * api related functionalities are written below
 */

/**
 * Loading Application level configuration data
 */
var config = require('../config/config.json');
var winston = require('../config/winston');


/**
 * helper functions
 */

var ApiInterceptor = require('../helpers/key-clock-authentication');



/**
 * external library used in APIs
 */

var Q = require('q');
var _ = require('underscore');
var moment = require('moment');
// var http = require('http');
// var https = require('https');
var path = require('path');



var _this = this;
var api = {};
api.validateToken = validateToken;

module.exports = api;

var keyCloakConfig = {
    authServerUrl: config.sunbird_keycloak_auth_server_url,
    realm: config.sunbird_keycloak_realm,
    clientId: config.sunbird_keycloak_client_id,
    public: config.sunbird_keycloak_public
};

var cacheConfig = {
    store: "memory",
    ttl: 1800
};

var apiInterceptor = new ApiInterceptor(keyCloakConfig, cacheConfig);


function validateToken(req, res) {

        var promise = new Promise(function (resolve, reject) {
            var token = req.headers["x-auth-token"];
            if (req.headers["x-auth-token"]) {
                apiInterceptor.validateToken(token, function (err, tokenData) {

                    if(tokenData){

                        // console.log("tokenData",tokenData);
                        resolve({ status: "success",userId:tokenData.userId });
                    }
                    if(err){

                        // console.log("err",err);
                        // console.log("tokenData",tokenData);
                        resolve({ status: "failed", message: err });
                    }
                });
            } else {
                resolve({ status: "failed", message: "x-auth-token not found in request" });
            }
        });
    return promise;
}


/**
 * name : health.js.
 * author : Aman Karki.
 * created-date : 21-July-2021.
 * Description : Health check helper functionality.
*/

// Dependencies
const mongodb = require("./mongodb");
const kafka = require("./kafka");
const { v1 : uuidv1 } = require('uuid');
const reportsHealthCheck = require("./reports");
const userManagementHealthCheck = require("./user-management");

const obj = {
    MONGO_DB: {
        NAME: 'Mongo.db',
        FAILED_CODE: 'MONGODB_HEALTH_FAILED',
        FAILED_MESSAGE: 'Mongo db is not connected'
    },
    KAFKA: {
        NAME: 'kafka',
        FAILED_CODE: 'KAFKA_HEALTH_FAILED',
        FAILED_MESSAGE: 'Kafka is not connected'
    },
    REPORTS_SERVICE: {
      NAME: 'reportsservice.api',
      FAILED_CODE: 'REPORTS_SERVICE_HEALTH_FAILED',
      FAILED_MESSAGE: 'Reports service is not healthy'
    },
    USER_MANAGEMENT_SERVICE: {
        NAME: 'userManagementservice.api',
        FAILED_CODE: 'USER_MANAGEMENT_SERVICE_HEALTH_FAILED',
        FAILED_MESSAGE: 'USer Management service is not healthy'
    },
    NAME: 'ImprovementServiceHealthCheck',
    API_VERSION: '1.0'
}

let health_check = async function(req,res) {

    let checks = [];
    let mongodbConnection = await mongodb.health_check();
    let kafkaConnection = await kafka.health_check();
    let reportsServiceStatus = await reportsHealthCheck.health_check();
    let userManagementServiceStatus = await userManagementHealthCheck.health_check();
    checks.push(singleCheckObj("KAFKA",kafkaConnection));
    checks.push(singleCheckObj("MONGO_DB",mongodbConnection));
    checks.push(singleCheckObj("REPORTS_SERVICE",reportsServiceStatus));
    checks.push(singleCheckObj("USER_MANAGEMENT_SERVICE",userManagementServiceStatus));

    let checkServices = checks.filter( check => check.healthy === false);

    let result = {
        name : obj.NAME,
        version : obj.API_VERSION,
        healthy : checkServices.length > 0 ? false : true,
        checks : checks
    };

    let responseData = response(req,result);
    res.status(200).json(responseData);
}

let healthCheckStatus = function(req,res) {
    let responseData = response(req);
    res.status(200).json(responseData);
}

let singleCheckObj = function( serviceName,isHealthy ) {
    return {
        name : obj[serviceName].NAME,
        healthy : isHealthy,
        err : !isHealthy ?  obj[serviceName].FAILED_CODE : "",
        errMsg : !isHealthy ? obj[serviceName].FAILED_MESSAGE : ""
    }
}

let response = function ( req,result ) {
    return {
        "id" : "improvementService.Health.API",
        "ver" : "1.0",
        "ts" : new Date(),
        "params" : {
            "resmsgid" : uuidv1(),
            "msgid" : req.headers['msgid'] || req.headers.msgid || uuidv1(),
            "status" : "successful",
            "err" : "null",
            "errMsg" : "null"
        },
        "status" : 200,
        result : result
    }
}

module.exports = {
    health_check : health_check,
    healthCheckStatus : healthCheckStatus
}
var mongoose = require('mongoose');
var Schema = mongoose.Schema,ObjectId = Schema.ObjectId;
var solutionsModel = mongoose.model('solutions',new mongoose.Schema({
            "resourceType":Array,
            "language":Array,
            "keywords":Array,
            "concepts":Array,
            "createdFor":Array,
            "type":String,
            "subType":String,
            "registry":Array,
            "deleted":Boolean,
            "externalId":String,
            "name":String,
            "description":String,
            "author":String,
            "createdAt":Date,
            "updatedAt":Date,
            "frameworkId":String,
            "entityTypeId":String,
            "entityType":String,
            "status":String,
            "isDeleted":Boolean,
            "isReusable":Boolean,
            "parentSolutionId":String,
            "baseProjectDetails":Object,
            "roles":Object,
            "programId":ObjectId
            // "usersId":Array

            // roles:{
            //     projectManagers:[],
            //     programManagers:[],
            //     collabrator:[]
            // }
}) );
module.exports = solutionsModel;
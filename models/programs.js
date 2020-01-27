// We should get this from samiksha service instead of hardcoding models in unnati
// and samiksha.

var mongoose = require('mongoose');
var Schema = mongoose.Schema,ObjectId = Schema.ObjectId;
var programModel = mongoose.model('programs',new mongoose.Schema({
    "externalId" : String,
	"name" : String,
	"solutionId":ObjectId,
	"description" : String,
	"owner" : String,
	"createdBy" : String,
	"updatedBy" : String,
	"isDeleted" : Boolean,
	"status" : String,
	"resourceType" : Array,
	"language" : Array,
	"keywords" : Array,
	"concepts" : Array,
	"createdFor" : Array,
	"imageCompression" : Array,
	"components" : Array,
	"updatedAt" : Date,
	"startDate" : Date,
	"endDate" : Date,
	"createdAt" : Date,
	"vision": String,
    "problemDefinition":String,
    "prerequisites":String,
    "assumptions":String,
    "resources":Array,
    "supportingDocuments":Array,
    "approaches":String,
    "successIndicators":String,
    "suggestedProject":String
}) );
module.exports = programModel;
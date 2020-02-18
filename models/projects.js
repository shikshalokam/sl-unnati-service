var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateFormat = moment.tz(Date.now(), "Asia/kolkata");
// mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true });

var Schema = mongoose.Schema,ObjectId = Schema.ObjectId;
var projectModel = mongoose.model('userProjects',new mongoose.Schema({
	"id": String,
	"title": String,
	"goal": String,
	"userId": String,
	"collaborator": Array,
	"organisation": String,
	"duration": String,
	"difficultyLevel": Object,
	"status": String,
	"createdAt":Date,
	// "lastSync": { type : Date, default: Date.now },
	"lastSync": Date,
	"primaryAudience": Array,
	"concepts": Array,
	"keywords":Array,
	"solutionId":ObjectId,
	"programId":ObjectId,
	"programManagers":Array,
	"isDeleted": { type : Boolean,default : false },
	"entityType":String,
	"entityId":ObjectId,
	"category":Array,
	"createdType":String,
	"createdBy":ObjectId,
	"isStarted":Boolean,
	"startDate":{ type:Date, default:dateFormat },
	"endDate":{ type:Date, default:dateFormat }
},{collection: 'userProjects'} ) );
module.exports = projectModel;

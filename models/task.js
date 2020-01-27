var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateFormat = moment.tz(Date.now(), "Asia/kolkata");

// console.log(dateThailand); // "2018-08-20T16:35:14.033+07:00"

var Schema = mongoose.Schema,ObjectId = Schema.ObjectId;
var taskModel = mongoose.model('userProjectsTasks',new mongoose.Schema({
			"id":String,
			"projectId":ObjectId,
			"title":String,
			"startDate": { type:Date, default:dateFormat },
			"endDate": { type:Date, default:dateFormat },
			"status": String,
			"assignedTo":Array,
			"lastSync" : Date,
			"createdAt":Date,
			"programId":ObjectId,
			"isDeleted":Boolean,
			"subTasks" : [
					{
						"title":String,
						"startDate": { type:Date, default:dateFormat },
						"endDate": { type:Date, default:dateFormat },
						"status": String,
						"isDeleted":false,
						"lastSync" : { type:Date, default:dateFormat },
						"assignedTo":Array
					}],
			"imageUrl" : { type : String , default : "" },
			"fileUrl" : { type : String ,default : "" },
			"remarks" : { type : String ,default : "" }
				
},{ collection:'userProjectsTasks' }) );
module.exports = taskModel;
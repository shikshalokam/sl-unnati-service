module.exports = {
    async up(db) {
   
      var ObjectId = require('mongoose').Types.ObjectId;
   
      global.migrationMsg = "Convert ObjectId To String In submissionDetails";
   
       let updatedProjectIds = [];
       let projectDocument = await db.collection('projects').find({"tasks.submissionDetails": { $exists: true }}).project({ _id: 1}).toArray();
       let chunkOfProjectDocument = _.chunk(projectDocument, 10);
       let projectIds;
       let projectDocuments;
   
       for (let pointerToProject = 0; pointerToProject < chunkOfProjectDocument.length; pointerToProject++) {
               projectIds = await chunkOfProjectDocument[pointerToProject].map(
                   projectDoc => {
                     return projectDoc._id;
                   }
               );
   
               projectDocuments = await db.collection("projects").find({
                 _id: { $in: projectIds },
                 "tasks.submissionDetails": { $exists: true }
               }).project({
                 "tasks.submissionDetails": 1,
                 "tasks._id": 1,
               }).toArray();
   
               await Promise.all(
               projectDocuments.map(async eachProjectDocument => {
   
                   let tasks = eachProjectDocument['tasks'];
   
                   for (let pointerToTaskArray = 0; pointerToTaskArray < tasks.length; pointerToTaskArray++) {
                       
                       let currentTask = tasks[pointerToTaskArray];
   
                       let submissionDetails = currentTask.submissionDetails;
                       let checkToUpdate =  false;
   
                       if(submissionDetails){
                           
                           if(submissionDetails.entityId && submissionDetails.entityId !== submissionDetails.entityId.toString()){
                               submissionDetails.entityId = submissionDetails.entityId.toString();
                               checkToUpdate =  true;
                           }
   
                           if(submissionDetails.programId && submissionDetails.programId !== submissionDetails.programId.toString()){
                               submissionDetails.programId = submissionDetails.programId.toString();
                               checkToUpdate =  true;
                           }
   
                           if(checkToUpdate){
   
                               let updateProjectData = await db.collection('projects').findOneAndUpdate({
                               "_id": eachProjectDocument._id,
                               "tasks._id": currentTask._id
                               }, {
                                   $set: {
                                       "tasks.$.submissionDetails": submissionDetails
                                   }
                               });
   
                               updatedProjectIds.push(eachProjectDocument._id)
                           }    
                       }      
                   }
               }))
           }
    },
    async down(db) {
       // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    }
   
   };
module.exports = {
  async up(db) {
 
     global.migrationMsg = "Update Solution Details in Project and ProjectTemplateTask";
 
     let updatedProjectIds = [];
     let projectDocument = await db.collection('projects').find({"tasks.type":"observation"}).project({ _id: 1}).toArray();
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
           "tasks.type":"observation"
         }).project({
           "tasks.solutionDetails": 1,
           "tasks._id": 1,
           "tasks.type": 1,
           "solutionId": 1,
           "solutionExternalId": 1
         }).toArray();
 
         await Promise.all(
             projectDocuments.map(async eachProjectDocument => {
 
               let solution = await db.collection('solutions').find({externalId: eachProjectDocument.solutionExternalId}).project({allowMultipleAssessemts: 1,isRubricDriven: 1,criteriaLevelReport: 1}).toArray();
                 
                 if(solution && solution.length > 0){
 
                     let solutionData = solution[0];
 
                 let tasks = eachProjectDocument['tasks'];
 
                   for (let pointerToTaskArray = 0; pointerToTaskArray < tasks.length; pointerToTaskArray++) {
                       
                       let currentTask = tasks[pointerToTaskArray];
                       if(currentTask.type == "observation"){
 
                           let solutionDetails = currentTask.solutionDetails;
                             if (!("allowMultipleAssessemts" in solutionDetails) || !("isRubricDriven" in solutionDetails) || !("criteriaLevelReport" in solutionDetails)) {
         
                               solutionDetails.allowMultipleAssessemts = solutionData.allowMultipleAssessemts;
                                 solutionDetails.isRubricDriven = solutionData.isRubricDriven;
                                 solutionDetails.criteriaLevelReport = solutionData.criteriaLevelReport ? solutionData.criteriaLevelReport : "";
 
                                 let updateProjectData = await db.collection('projects').findOneAndUpdate({
                                     "_id": eachProjectDocument._id,
                                     "tasks._id": currentTask._id
                                 }, {
                                     $set: {
                                         "tasks.$.solutionDetails": solutionDetails
                                     }
                                 });
 
                                 updatedProjectIds.push(eachProjectDocument._id)
                           }
                       }
                   }
               }
             }))
     }
 
     console.log(updatedProjectIds,"updatedProjectIds")
 
     let updatedProjectTempleteTaskIds = [];
     let templeteTaskDocument = await db.collection('projectTemplateTasks').find({"type":"observation"}).project({ _id: 1}).toArray();
     let chunkOfTempleteTaskDocument = _.chunk(templeteTaskDocument, 10);
     let templeteTaskDocuments;
     let templeteTaskIds;
 
     for (let pointerToTempleteTask = 0; pointerToTempleteTask < chunkOfTempleteTaskDocument.length; pointerToTempleteTask++) {
         templeteTaskIds = await chunkOfTempleteTaskDocument[pointerToTempleteTask].map(
             templateDoc => {
               return templateDoc._id;
             }
         );
 
         templeteTaskDocuments = await db.collection("projectTemplateTasks").find({
           _id: { $in: templeteTaskIds },
           type:"observation"
         }).project({
           "solutionDetails": 1,
           "type": 1
         }).toArray();
 
         await Promise.all(
             templeteTaskDocuments.map(async eachTempleteTaskDocument => {
 
                 if(eachTempleteTaskDocument.type == "observation"){
 
                   let solutionId = eachTempleteTaskDocument.solutionDetails.externalId;
                     let solution = await db.collection('solutions').find({externalId: solutionId}).project({allowMultipleAssessemts: 1,isRubricDriven: 1,criteriaLevelReport: 1}).toArray();
                 
                     if(solution && solution.length > 0){
 
                         let solutionData = solution[0];
 
                         let solutionDetails = eachTempleteTaskDocument.solutionDetails;
 
                         if (!("allowMultipleAssessemts" in solutionDetails) || !("isRubricDriven" in solutionDetails) || !("criteriaLevelReport" in solutionDetails)) {
   
                             solutionDetails.allowMultipleAssessemts = solutionData.allowMultipleAssessemts;
                             solutionDetails.isRubricDriven = solutionData.isRubricDriven;
                             solutionDetails.criteriaLevelReport = solutionData.criteriaLevelReport ? solutionData.criteriaLevelReport : "";
 
                             let updateTempleteTask = await db.collection('projectTemplateTasks').findOneAndUpdate({
                                 "_id": eachTempleteTaskDocument._id,
                             }, {
                                 $set: {
                                     "solutionDetails": solutionDetails
                                 }
                             });
 
                             updatedProjectTempleteTaskIds.push(eachTempleteTaskDocument._id)
                         }
                     }
                 }  
             }))
     }
 
     console.log(updatedProjectTempleteTaskIds,"updatedProjectTempleteTaskIds")
 
  },
  async down(db) {
     // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
 
 };
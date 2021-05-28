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
 
     let updatedProjectTemplateTaskIds = [];
     let templateTaskDocument = await db.collection('projectTemplateTasks').find({"type":"observation"}).project({ _id: 1}).toArray();
     let chunkOfTemplateTaskDocument = _.chunk(templateTaskDocument, 10);
     let templateTaskDocuments;
     let templateTaskIds;
 
    for (let pointerToTemplateTask = 0; pointerToTemplateTask < chunkOfTemplateTaskDocument.length; pointerToTemplateTask++) {
         templateTaskIds = await chunkOfTemplateTaskDocument[pointerToTemplateTask].map(
             templateDoc => {
               return templateDoc._id;
             }
         );
 
         templateTaskDocuments = await db.collection("projectTemplateTasks").find({
           _id: { $in: templateTaskIds },
           type:"observation"
         }).project({
           "solutionDetails": 1,
           "type": 1
         }).toArray();
 
         await Promise.all(
             templateTaskDocuments.map(async eachTemplateTaskDocument => {
 
                 if(eachTemplateTaskDocument.type == "observation"){
 
                   let solutionId = eachTemplateTaskDocument.solutionDetails.externalId;
                     let solution = await db.collection('solutions').find({externalId: solutionId}).project({allowMultipleAssessemts: 1,isRubricDriven: 1,criteriaLevelReport: 1}).toArray();
                 
                     if(solution && solution.length > 0){
 
                         let solutionData = solution[0];
 
                         let solutionDetails = eachTemplateTaskDocument.solutionDetails;
 
                         if (!("allowMultipleAssessemts" in solutionDetails) || !("isRubricDriven" in solutionDetails) || !("criteriaLevelReport" in solutionDetails)) {
   
                             solutionDetails.allowMultipleAssessemts = solutionData.allowMultipleAssessemts;
                             solutionDetails.isRubricDriven = solutionData.isRubricDriven;
                             solutionDetails.criteriaLevelReport = solutionData.criteriaLevelReport ? solutionData.criteriaLevelReport : "";
 
                             let updateTemplateTask = await db.collection('projectTemplateTasks').findOneAndUpdate({
                                 "_id": eachTemplateTaskDocument._id,
                             }, {
                                 $set: {
                                     "solutionDetails": solutionDetails
                                 }
                             });
 
                             updatedProjectTemplateTaskIds.push(eachTemplateTaskDocument._id)
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
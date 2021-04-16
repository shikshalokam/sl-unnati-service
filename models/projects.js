/**
 * name : projects.js.
 * author : Aman Karki.
 * created-date : 14-July-2020.
 * Description : Schema for projects.
 */

module.exports = {
    name: "projects",
    schema: {
        title : String,
        description : String,
        taskReport : {
            type : Object,
            default : {}
        },
        metaInformation : {
            type : Object,
            default : {}
        },
        userId : {
            type : String,
            default : "SYSTEM",
            index: true
        },
        userRole : {
            type : String,
            default : "",
            index: true
        },
        createdFor : {
            type : Array,
            default : []
        },
        status : {
            type : String,
            default : "notStarted",
            index: true
        },
        lastDownloadedAt : Date,
        syncedAt : Date,
        isDeleted : {
            type : Boolean,
            default : false
        },
        categories : {
            type : Array,
            default : []
        },
        createdBy : {
            type : String,
            default : "SYSTEM"
        },
        tasks : {
            type : Array,
            default : []
        },
        entityInformation : {
            type : Object,
            default : {}
        },
        programInformation : {
            type : Object,
            default : {}
        },
        solutionInformation : {
            type : Object,
            default : {}
        },
        updatedBy : {
            type : String,
            default : "SYSTEM"
        },
        projectTemplateId : {
            type : "ObjectId",
            index: true
        },
        projectTemplateExternalId : {
            type : String,
            index: true
        },
        startDate: Date,
        endDate: Date,
        rootOrganisations : {
            type : [String],
            default : []
        },
        learningResources : {
            type : Array,
            default : []
        },
        entityId : {
            type : "ObjectId",
            index : true
        },
        programId : {
            type : "ObjectId",
            index : true
        },
        programExternalId : {
            type : String,
            index : true
        },
        solutionId : {
            type : "ObjectId",
            index : true
        },
        solutionExternalId : {
            type : String,
            index : true
        },
        isAPrivateProgram : Boolean,
        appInformation : Object,
        userRoleInformtion : Object,
        hasAcceptedTAndC : {
            type : Boolean,
            default : false
        },
        referenceFrom : {
            type : String,
            index : true
        },
        submissions : Object
    }
};

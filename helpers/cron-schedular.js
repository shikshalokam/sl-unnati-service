var kafka = require('kafka-node');
var config = require('../config/config.json');
var schedule = require('node-schedule');
var commonHandler = require('./common-handler');
var notifications = require('./notifications');


schedule.scheduleJob(config.cronConfiguration.pendingTaskScheduleTime, async function () {
    let arrayOfDays = config.cronConfiguration.pendingTaskPriorDays;
    Promise.all(
        arrayOfDays.map(async scheduleDays => {
            console.log("============= Cron Schedular start for Pending task Prior to " + scheduleDays + "========== ")

            let response = await commonHandler.pendingTask(scheduleDays);
            // console.log("response",response.notificationList);
            if (response && response.notificationList) {
                await Promise.all(
                    response.notificationList.map(async ele => {
                        let pushToKafka = await notifications.pushToKafka(ele.user_id, ele)
                        // console.log("list ==",ele);
                    })
                );
            } else {
                console.log("No pending task found");

            }
            console.log("============= Cron Schedular End for Pending task Prior to " + scheduleDays + " ========== ")
        })
    )
});

schedule.scheduleJob(config.cronConfiguration.unFinishedProjectScheduleTime, async function () {


    let arrayOfDays = config.cronConfiguration.pendingProjectPriorDays;
    Promise.all(
        arrayOfDays.map(async scheduleDays => {

            console.log("============= Cron Schedular start for unFinished Projects for " + scheduleDays + " ========== ")
            let response = await commonHandler.unFinishedProjects(scheduleDays);
            // console.log("response",response.notificationList);
            if (response && response.notificationList) {
                await Promise.all(
                    response.notificationList.map(async ele => {
                        let pushToKafka = await notifications.pushToKafka(ele.user_id, ele)
                        console.log("ele pending projects", ele);
                    })
                );
            } else {
                console.log("No pending task found");
            }
            console.log("============= Cron Schedular End for unFinished Projects ========== ")

        })
    )
});


schedule.scheduleJob(config.cronConfiguration.subTaskPendingScheduleTime, async function () {


    let arrayOfDays = config.cronConfiguration.pendingSubTaskPriorDays;
    Promise.all(
        arrayOfDays.map(async scheduleDays => {

    console.log("============= Cron Schedular start for sub task pending Projects for "+ scheduleDays +" days ========== ")
    let response = await commonHandler.subTaskPending(scheduleDays);
    // console.log("response",response.notificationList);
    if (response && response.notificationList) {
        await Promise.all(
            response.notificationList.map(async ele => {
                console.log("ele==", ele);
                let pushToKafka = await notifications.pushToKafka(ele.user_id, ele)
                // console.log("ele pending projects",ele);
            })
        );
    } else {
        console.log("No pending task found");
    }
    console.log("============= Cron Schedular End for sub task pending Projects "+ scheduleDays +" days ========== ")
        })
    )
});



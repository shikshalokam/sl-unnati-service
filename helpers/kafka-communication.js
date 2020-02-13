/**
 * name : kafka-communication.js
 * author : Aman Jung Karki
 * created-date : 25-Nov-2019
 * Description : Push data to particular topic in kafka.
 */

// Dependencies

let configuration = require('../config/config.json');
let kafkaCommunicationsOnOff = 
(
    !configuration.KAFKA_COMMUNICATIONS_ON_OFF || 
    configuration.KAFKA_COMMUNICATIONS_ON_OFF != "OFF"
) ? "ON" : "OFF";

const notificationsKafkaTopic = 
configuration.Kafka.NOTIFICATIONS_TOPIC ? 
configuration.Kafka.NOTIFICATIONS_TOPIC : "sl-notifications-dev";

 /**
      * Push user profile notifications to kafka.
      * @method
      * @name pushUserProfileNotificationsToKafka
      * @param {Object} message - notification message data.               
      * @returns {Object} kafka pushed message.
*/

let pushUserProfileNotificationsToKafka = function (message) {
  return new Promise(async (resolve, reject) => {
      try {

          let kafkaPushStatus = await _pushMessageToKafka([{
            topic: notificationsKafkaTopic,
            messages: JSON.stringify(message)
          }])

          return resolve(kafkaPushStatus)

      } catch (error) {
          return reject(error);
      }
  })
}

 /**
      * Internal helper function for pushing to kafka.
      * @method
      * @name _pushMessageToKafka
      * @param {Object} payload - kafka payload.               
      * @returns {Object} Push message to kafka.
*/

let _pushMessageToKafka = function(payload) {
  return new Promise((resolve, reject) => {

    if (kafkaCommunicationsOnOff != "ON") {
      throw reject("Kafka configuration is not done")
    }

    kafkaClient.kafkaProducer.send(payload, (err, data) => {
      if (err) {
        return reject("Kafka push to topic "+ payload[0].topic +" failed.")
      } else {
        return resolve(data)
      }
    })

  }).then(result => {

    if(result[payload[0].topic][0] >0) {
      return {
        status : "success",
        message: "Kafka push to topic "+ payload[0].topic +" successful with number - "+result[payload[0].topic][0]
      }
    }

  }).catch((err) => {
    return {
      status : "failed",
      message: err
    }
  })
}

module.exports = {
  pushUserProfileNotificationsToKafka : pushUserProfileNotificationsToKafka
};


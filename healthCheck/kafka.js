/**
 * name : kafka.js.
 * author : Aman Karki.
 * created-date : 21-July-2021.
 * Description : Kafka health check functionality.
*/

// Dependencies

const kafka = require('kafka-node');
var config = require('../config/config.json');

function health_check() {
    return new Promise( async (resolve,reject) => {
        const client = new kafka.KafkaClient({
            kafkaHost : config.Kafka.host
        });

        const producer = new kafka.Producer(client);

        producer.on("error", function (err) {
            return resolve(false);
        })
        producer.on('ready', function () {
            return resolve(true);
        });
    })
}

module.exports = {
    health_check : health_check
}
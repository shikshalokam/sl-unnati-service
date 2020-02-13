/**
 * name : kafka-config.js
 * author : Aman Jung Karki
 * created-date : 13-feb-2020
 * Description : All kafka configuration data.
 */

//dependencies
const kafka = require('kafka-node');
var config = require('../config/config.json');

/**
   * Kafka connection.
*/

var connect = function() {

    let Producer = kafka.Producer;
    let KeyedMessage = kafka.KeyedMessage;
    let client = new kafka.KafkaClient({
      kafkaHost : config.Kafka.host
    });

    client.on('error', function(error) {
      console.log("kafka connection error!");
    });

    producer = new Producer(client);

    producer.on('ready', function () {
      console.log("Connected to Kafka");
    });
   
    producer.on('error', function (err) {
      console.log("kafka producer creation error!");
    })

    return {
      kafkaProducer: producer,
      kafkaKeyedMessage: KeyedMessage
    };

};

module.exports = connect;





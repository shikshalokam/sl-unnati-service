var kafka = require('kafka-node');
var config = require('../config/config.json');
var api = {};



var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    Consumer = kafka.Consumer,
    KeyedMessage = kafka.KeyedMessage;

client = new kafka.KafkaClient({ kafkaHost: config.Kafka.host });

producer = new Producer(client),
    producer.on('ready', function () {
        console.log("Connected to kafka");    
    });

producer.on('error', function (err) {
    console.log("error while connecting to kafka");
})

module.exports  = { 
    producer:producer
}




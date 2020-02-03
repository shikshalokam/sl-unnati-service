var kafka = require('kafka-node');
var config = require('../config/config.json');

var kafkaProcedure = require('../config/kafka-config');

var api = {};
api.pushToKafka = pushToKafka;
module.exports = api;


// console.log("kafkaProcedure",kafkaProcedure.producer);

// kafkaProcedure.producer.on('ready', function () {

//     console.log("connected to kaftka");

// });


// var kafka = require('kafka-node'),
//     Producer = kafka.Producer,
//     Consumer = kafka.Consumer,
//     KeyedMessage = kafka.KeyedMessage;

// client = new kafka.KafkaClient({ kafkaHost: config.Kafka.host });

// producer = new Producer(client),
//     producer.on('ready', function () {
//         console.log("ready to send messages to kafka");

//         //  let message = {
//         //         user_id: "c828382f-89d4-4dc6-ae14-47a6d0337364",
//         //         appName: "unnati",
//         //         text:"sample test"
//         //     }
//         // let payloads = [
//         //     { topic: config.Kafka.notification_topic, messages: JSON.stringify(message), partition: 0 }
//         // ];
//         // producer.send(payloads, function (err, data) {
//         //     console.log("data pushed to kafka for userId :data",data);
//         //     // res.send("message sent");
//         // });


//     });

// producer.on('error', function (err) {
//     console.log("error while connecting to kafka");
// })


function pushToKafka(userId, message) {
    return new Promise((resolve, reject) => {
        // request.post(options, callback); 
        try {
            message.appName = "unnati";
            payloads = [
                { topic: config.Kafka.notification_topic, messages: JSON.stringify(message), partition: 0 }
            ];
            kafkaProcedure.producer.send(payloads, function (err, data) {
                console.log("data pushed to kafka for userId : ",userId);
                // res.send("message sent");
            });
            // console.log("kafka called");
            resolve();
        } catch (error) {
        }
    })
}
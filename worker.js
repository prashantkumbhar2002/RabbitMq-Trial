#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (error, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'task_queue';

        // This makes sure the queue is declared before attempting to consume from it
        channel.assertQueue(queue, {
            durable: true   //task_queue queue won't be lost even if RabbitMQ restarts
        });

        
        channel.prefetch(1);    //tells RabbitMQ not to give more than one message to a worker at a time


        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, function (msg) {
            var secs = msg.content.toString().split('.').length - 1;

            console.log(" [x] Received %s", msg.content.toString());
            setTimeout(function () {
                console.log(" [x] Done");
            }, secs * 1000);
        }, {
            // automatic acknowledgment mode,
            // see /docs/confirms for details
            noAck: false
        });
    });
});
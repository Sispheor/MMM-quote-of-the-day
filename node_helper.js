const NodeHelper = require('node_helper');
const request = require("request");


module.exports = NodeHelper.create({
    start: function() {
        console.log(this.name + ' helper started');

    },

    getNewQuote: function(url) {
        var self = this;
        options = {
            url: url,
            json: true,
            method: "GET"
        }

        request(options, function (error, response, body) {
            if (error) { return console.log(error); };
            console.log("API call result: " + body);
            // send notification to the module
            self.sendSocketNotification('QUOTE_RESULT', body);
        });
    },

    socketNotificationReceived: function(notification, payload) {
        console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
        if (notification === 'GET_QUOTE') {
            this.getNewQuote(payload);
        }
    }

});